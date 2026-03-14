const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Service to handle AWS CLI operations for EKS.
 */
class AwsService {
  /**
   * Lists EKS clusters for a given profile and region.
   * @param {string} profile - AWS CLI profile name.
   * @param {string} region - AWS region.
   * @returns {Promise<string[]>} List of cluster names.
   */
  async listEksClusters(profile, region = 'us-east-1') {
    const command = `aws eks list-clusters --profile ${profile} --region ${region}`;
    console.log(`[AwsService] Listing clusters for profile ${profile} in ${region}`);
    
    try {
      const { stdout } = await execPromise(command);
      const data = JSON.parse(stdout);
      return data.clusters || [];
    } catch (error) {
      console.error('[AwsService] Error listing clusters:', error.stderr || error.message);
      throw new Error(error.stderr || "Falha ao listar clusters EKS. Verifique o profile e a região.");
    }
  }

  /**
   * Updates the local kubeconfig file for a specific cluster.
   * Handles SSO login if session is expired.
   * @param {Object} cluster - Cluster configuration object.
   */
  async updateKubeconfig(cluster) {
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
      return this.handleUpdateKubeconfigError(stderr, profile, ssoUrl);
    }
  }

  /**
   * Specialized error handler for kubeconfig updates.
   */
  handleUpdateKubeconfigError(stderr, profile, ssoUrl) {
    if (stderr.includes('not found') && ssoUrl) {
      throw new Error(`O profile '${profile}' não foi encontrado. Execute no terminal: aws configure sso --profile ${profile}`);
    }

    if (stderr.includes('expired') || stderr.includes('login') || stderr.includes('Token has expired')) {
      console.log(`[AwsService] Session expired for profile: ${profile}. Attempting SSO login...`);
      exec(`aws sso login --profile ${profile}`); // Non-blocking login trigger
      throw new Error(`Sua sessão AWS (${profile}) expirou. Uma janela de login foi aberta. Após logar, tente reconectar.`);
    }

    console.error(`[AwsService] Command failed: ${stderr}`);
    throw new Error(stderr || "Erro desconhecido ao atualizar kubeconfig");
  }
}

module.exports = new AwsService();
