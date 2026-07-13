const baseConfig = {
  username: process.env.DB_USERNAME || "sql8800339",
  password: process.env.DB_PASSWORD || "W4SYzqlMsm",
  database: process.env.DB_NAME || "sql8800339",
  host: process.env.DB_HOST || "sql8.freesqldatabase.com",
  dialect: "mysql",
  port: Number(process.env.DB_PORT || 3306),
  logging: false,
};

if (process.env.DB_SSL === "true") {
  baseConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

const config = {
  development: { ...baseConfig },
  production: { ...baseConfig },
  test: { ...baseConfig },
};

module.exports = config;
