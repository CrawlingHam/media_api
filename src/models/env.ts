const ENVIRONMENT_VARIABLES: string[] = ['SERVER_DOMAIN', 'ALLOWED_ORIGINS'];

function validateEnv(): void {
  console.log('🔍 Validating environment variables');

  for (const variable of ENVIRONMENT_VARIABLES) {
    const env_var = process.env[variable];
    if (!env_var) {
      console.error(`❌ ${variable} is not set`);
      process.exit(1);
    }

    if (variable === ENVIRONMENT_VARIABLES[0]) {
      const portMatch = env_var.match(/:(\d+)$/);
      if (!portMatch) {
        console.error(`❌ ${variable} must have a port`);
        process.exit(1);
      }
    }

    if (variable === ENVIRONMENT_VARIABLES[1]) {
      if (env_var.split(',').length === 0) {
        console.error(`❌ ${variable} must have at least one origin`);
        process.exit(1);
      }
    }
  }

  console.log('✅ All environment variables are set');
}

export { validateEnv };
