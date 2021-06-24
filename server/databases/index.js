const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const database = process.env.DB_NAME;

export const dbConnection = {
  url: `mongodb://${host}:${port}/${database}`,
  options: {
    useUnifiedTopology: true,
  },
};
