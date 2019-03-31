@echo off
@rem See bluemix and CF documentation
@rem https://console.bluemix.net/docs/runtimes/nodejs/getting-started.html#getting-started-tutorial

echo Setup environment variables using setenv.bat
call ./setenv.bat

echo Update manifest based on environement variables. 
call ./updateManifest.bat

echo Login to bluemix using environment variables
ibmcloud login -r %CF_REGION% -u %CF_USER% -p %CF_PASSWORD%

echo Set bluemix target
ibmcloud target --cf-api api.ng.bluemix.net -o %CF_ORG% -s %CF_SPACE%

echo Deploy the application
echo ibmcloud cf push

@echo Push completed. Display status now
ibmcloud cf apps

@rem cf stop %CF_APP_NAME%
@rem cf start %CF_APP_NAME%
