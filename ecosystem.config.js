module.exports = {
  apps: [
    {
      name: "image",
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
