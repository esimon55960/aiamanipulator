@rem This is file that reads manifest_template.yml and substitutes all the 
@rem environment variables. The output is written to manifest.yml

@echo off
goto :start

:expand
echo %~1 >> manifest.yml
goto:eof

:start
IF EXIST manifest.yml (
    del manifest.yml
)
for /f "delims=" %%i in (manifest_template.yml) do call:expand "%%i"
echo manifest.yml updated. 
