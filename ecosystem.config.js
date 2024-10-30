module.exports = {
  apps: [
    {
      name: "express-cron-server",
      script: "server.js",
      watch: true,
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
