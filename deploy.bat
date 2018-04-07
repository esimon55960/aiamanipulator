@rem See bluemix and CF documentation
@rem https://console.bluemix.net/docs/runtimes/nodejs/getting-started.html#getting-started-tutorial

cf api api.ng.bluemix.net
cf login -u %CF_USER% -p %CF_PASSWORD%
cf push

@echo Push completed. Display status now
cf apps

@rem cf stop AIAManipulator
@rem cf start AIAManipulator
