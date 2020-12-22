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
    exp_backoff_restart_delay: 100,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
  }],
  deploy: {
    production: {
      key: '~/.ssh/katarina.pem',
      user: 'ubuntu',
      host: 'ec2-54-194-95-170.eu-west-1.compute.amazonaws.com',
      ref: 'origin/master',
      repo: 'git@github.com:Dartv/katarina_bot.git',
      path: '/opt/pm2/katarina',
      max_memory_restart: '600M',
      'pre-deploy': 'git clean  -d  -f . && git reset --hard HEAD',
      'post-deploy': 'rm -rf dist node_modules && npm i && npm run build && pm2 startOrRestart ecosystem.config.js --env production --update-env',
    },
  },
};
