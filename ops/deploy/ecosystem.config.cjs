module.exports = {
  apps: [
    {
      name: "sonhomagico-web",
      cwd: "/home/Mágico",
      script: "dist/index.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 6100,
        MYSQL_HOST: "127.0.0.1",
        MYSQL_PORT: 3308,
        MYSQL_DATABASE: "sonho_magico",
        MYSQL_USER: "sonho_magico",
        MYSQL_PASSWORD: "change_this_mysql_password",
        JWT_SECRET: "smj_prod_2026_4f7a9c1e6b2d8f5a0c3e7d1b9a4c6f8e",
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      time: true,
    },
  ],
};
