module.exports = {
  apps: [{
    name: "image",
    script: "server.js",  // or "npm",
    // args: "start",    // use if script is "npm"
    watch: true,
    env: {
      NODE_ENV: "development",
      PORT: 3001
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3001
    },
    max_memory_restart: "1G",
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    time: true,
    instance_var: 'INSTANCE_ID',
  }]
}