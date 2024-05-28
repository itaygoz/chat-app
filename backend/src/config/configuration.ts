export default () => ({
  port: parseInt(process.env.PORT) || 3000,
  historyBufferSize: parseInt(process.env.HISTORY_BUFFER_SIZE) || 50,
});
