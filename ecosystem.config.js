const envDev = require('./env/lookenv.dev');
const envProd = require('./env/lookenv.prod');

module.exports = {
  apps: [{
    name: 'katarina',
    script: 'npm',
    args: 'run start',
    instances: 1,
    autorestart: true,
    watch: false,
    env: envDev,
    env_production: envProd,
    cwd: __dirname,
    exp_backoff_restart_delay: 100,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    wait_ready: true,
  }],
  deploy: {
    production: {
      key: '~/.ssh/katarina.pem',
      user: 'ubuntu',
      host: '54.93.199.214',
      ref: 'origin/master',
      repo: 'https://github.com/Dartv/katarina_bot.git',
      path: '/opt/pm2/katarina',
      max_memory_restart: '600M',
      'pre-deploy': 'npm i -g yarn && git reset --hard',
      'post-deploy': 'yarn install && yarn build && pm2 startOrRestart ecosystem.config.js --env production --update-env',
    },
  },
};
