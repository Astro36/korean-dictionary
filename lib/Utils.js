const cluster = require('cluster');
const request = require('request');
const numCPUs = require('os').cpus().length;

const requestParallel = (urls, options, callback) => {
  const { workers } = cluster;
  const urlsCount = urls.length;

  if (cluster.isMaster) {
    let idx = 0;

    const messageHandler = (message) => {
      if (message.type === 'response') {
        const { data } = message;
        if (idx < urlsCount) {
          workers[data.workerId].send({
            type: 'request',
            data: {
              workerId: data.workerId,
              url: urls[idx],
            },
          });
        }
        idx += 1;
        callback(data.error, data.response, data.body);
      }
    };

    for (let i = 0; i < numCPUs; i += 1) {
      cluster.fork().on('message', messageHandler);
    }

    Object.entries(workers).forEach(([workerId, worker]) => {
      worker.send({
        type: 'request',
        data: {
          workerId,
          url: urls[idx],
        },
      });
      idx += 1;
    });
  } else {
    process.on('message', (message) => {
      if (message.type === 'request') {
        const { data } = message;
        request(Object.assign({ url: data.url }, options), (error, response, body) => {
          process.send({
            type: 'response',
            data: {
              workerId: data.workerId,
              error,
              response,
              body,
            },
          });
        });
      }
    });
  }
};

const requestParallelAsync = (urls, options) => new Promise((resolve) => {
  const responses = [];
  requestParallel(urls, options, (error, response, body) => {
    responses.push([error, response, body]);
    if (responses.length === urls.length) {
      resolve(responses);
    }
  });
});

exports.requestParallel = requestParallel;
exports.requestParallelAsync = requestParallelAsync;
