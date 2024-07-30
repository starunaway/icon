const defaultHost = 'http://ep.lanma-inc.com/api/icon';

// const defaultHost = 'http://30.1.11.239:4001/api';
// const defaultHost = 'http://localhost:4001/api';

const host = process.env.HOST || defaultHost;

export default host;
