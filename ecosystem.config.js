module.exports = {
  apps: [{
    name: "image",
    script: "server.js",
    watch: false,  // Changed to false in production to avoid unnecessary restarts
    instances: 2,  // Set to match your 2 vCPUs
    exec_mode: "cluster", // Added to enable load balancing across CPUs
    env: {
      NODE_ENV: "development",
      PORT: 3001,
      NODE_OPTIONS: "--max-old-space-size=2048" // 2GB per instance
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3001,
      NODE_OPTIONS: "--max-old-space-size=2048"
    },
    max_memory_restart: "2G", // Increased for image processing
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    time: true,
    instance_var: 'INSTANCE_ID',
    wait_ready: true, // Added to ensure app is fully started before accepting requests
    listen_timeout: 3000, // Will wait 3 seconds for app to signal ready
    kill_timeout: 5000,   // Wait 5 seconds before forcing kill
  }]
}