const { exec, spawn } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const { shell } = require('electron');
const execPromise = util.promisify(exec);

/**
 * Service to handle AWS CLI operations for EKS.
 */
class AwsService {
  /**
   * Lists EKS clusters for a given profile and region.
   * @param {Object} params - Parameters object.
   * @param {string} params.profile - AWS CLI profile name.
   * @param {string} params.region - AWS region.
   * @param {string} params.ssoUrl - SSO URL (optional).
   * @returns {Promise<string[]>} List of cluster names.
   */
  async listEksClusters({ profile, region = 'us-east-1', ssoUrl }) {
    const command = `aws eks list-clusters --profile ${profile} --region ${region}`;
    console.log(`[AwsService] Listing clusters for profile ${profile} in ${region}`);
    
    try {
      const { stdout } = await execPromise(command);
      const data = JSON.parse(stdout);
      return data.clusters || [];
    } catch (error) {
      const stderr = error.stderr || error.message || '';
      return await this.handleUpdateKubeconfigError(stderr, profile, ssoUrl);
    }
  }

  /**
   * Updates the local kubeconfig file for a specific cluster.
   * Handles SSO login if session is expired.
   * @param {Object} cluster - Cluster configuration object.
   */
  async updateKubeconfig(cluster) {
    if (process.env.DEMO_MODE === 'true' && cluster.name === 'demonstracao') {
      console.log('[DEMO] Skipping real updateKubeconfig for demo cluster');
      return "Using DEMO MODE for cluster: demonstracao";
    }

    const { name, region, profile, accessKeyId, secretAccessKey, sessionToken, ssoUrl } = cluster;
    const finalRegion = region || 'us-east-1';
    
    const env = { ...process.env };
    if (accessKeyId && secretAccessKey && sessionToken) {
      console.log(`[AwsService] Using manual credentials for cluster: ${name}`);
      env.AWS_ACCESS_KEY_ID = accessKeyId;
      env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
      env.AWS_SESSION_TOKEN = sessionToken;
    }

    const command = `aws eks update-kubeconfig --name ${name} --region ${finalRegion} --profile ${profile}`;
    console.log(`[AwsService] Updating kubeconfig for ${name}`);
    
    try {
      const { stdout } = await execPromise(command, { env });
      console.log(`[AwsService] Kubeconfig updated: ${stdout.trim()}`);
      return stdout;
    } catch (error) {
      const stderr = error.stderr || '';
      return await this.handleUpdateKubeconfigError(stderr, profile, ssoUrl);
    }
  }

  /**
   * Lists available AWS profiles.
   * @returns {Promise<string[]>} List of profile names.
   */
  async listProfiles() {
    try {
      const { stdout } = await execPromise('aws configure list-profiles');
      return stdout.trim().split(/\r?\n/).filter(profile => profile.trim() !== '');
    } catch (error) {
      console.error('[AwsService] Error listing profiles:', error.message);
      // Fallback: try parsing credentials/config files if CLI fails
      try {
        const profiles = new Set();
        const homeDir = process.env.HOME || process.env.USERPROFILE;
        const configPath = path.join(homeDir, '.aws', 'config');
        const credentialsPath = path.join(homeDir, '.aws', 'credentials');

        if (fs.existsSync(configPath)) {
          const content = fs.readFileSync(configPath, 'utf8');
          const matches = content.matchAll(/\[(?:profile )?([^\]]+)\]/g);
          for (const match of matches) {
            profiles.add(match[1]);
          }
        }
        if (fs.existsSync(credentialsPath)) {
          const content = fs.readFileSync(credentialsPath, 'utf8');
          const matches = content.matchAll(/\[([^\]]+)\]/g);
          for (const match of matches) {
            profiles.add(match[1]);
          }
        }
        return Array.from(profiles);
      } catch (innerError) {
        console.error('[AwsService] Fallback profile listing failed:', innerError.message);
        return ['default'];
      }
    }
  }

  /**
   * Specialized error handler for AWS errors (kubeconfig updates or cluster listing).
   */
  async handleUpdateKubeconfigError(stderr, profile, ssoUrl) {
    if (stderr.includes('not found') && ssoUrl) {
      throw new Error(`O profile '${profile}' não foi encontrado. Execute no terminal: aws configure sso --profile ${profile}`);
    }

    if (stderr.includes('expired') || stderr.includes('login') || stderr.includes('Token has expired') || stderr.includes('ExpiredTokenException')) {
      console.log(`[AwsService] Session expired for profile: ${profile}. Attempting SSO login...`);
      
      let finalSsoUrl = ssoUrl;
      
      // If we don't have an SSO URL, let's try to find one in ~/.aws/config
      if (!finalSsoUrl) {
        finalSsoUrl = await this.findSsoUrlInConfig(profile);
      }

      if (finalSsoUrl) {
        console.log(`[AwsService] Opening browser for SSO login: ${finalSsoUrl}`);
        shell.openExternal(finalSsoUrl);
      }

      // Try running the login command. Even if it fails to open the browser itself, 
      // it might output a URL we could potentially use (though shell.openExternal is preferred).
      exec(`aws sso login --profile ${profile}`); 

      throw new Error(`Sua sessão AWS (${profile}) expirou. Uma janela de login foi aberta no seu navegador (ou use 'aws sso login --profile ${profile}' no terminal). Após logar, tente reconectar.`);
    }

    console.error(`[AwsService] Command failed: ${stderr}`);
    throw new Error(stderr || "Erro desconhecido ao processar comando AWS");
  }

  /**
   * Attempts to find the SSO Start URL in the AWS config file.
   */
  async findSsoUrlInConfig(profile) {
    try {
      // First, try using AWS CLI to get the URL
      const { stdout } = await execPromise(`aws configure get sso_start_url --profile ${profile}`).catch(() => ({ stdout: '' }));
      if (stdout.trim()) return stdout.trim();

      // If CLI fails (e.g. profile not in config but in credentials), try parsing the config file directly
      const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.aws', 'config');
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        // Try finding it for the specific profile
        const profileRegex = new RegExp(`\\[profile ${profile}\\][\\s\\S]*?sso_start_url\\s*=\\s*(.+)`, 'i');
        const match = configContent.match(profileRegex);
        if (match && match[1]) return match[1].trim();

        // Fallback: try finding ANY sso_start_url in the file (often there's only one or they are similar)
        const globalSsoMatch = configContent.match(/sso_start_url\s*=\s*(.+)/i);
        if (globalSsoMatch && globalSsoMatch[1]) return globalSsoMatch[1].trim();
      }
    } catch (err) {
      console.warn('[AwsService] Failed to search for SSO URL in config:', err.message);
    }
    return null;
  }
}

module.exports = new AwsService();
