# Changelog
All notable changes to this project will be documented in this file.

### v1.1.2 - 2019-04-06
- Update jszip from version 3.1.5 to 3.2.1 in attempt to fix problem with empty 
    block file causing problems in MIT App Inventor. This did NOT fix the problem.
- Change the `AIAFile.loadFromStream()` so it parsed and persisted the input instead of just
   parsing it. This fixes the problem with empty block files because the empty blocks were
   already replaced with a stub during initial parse. We just weren't persisting that. 

### v1.1.1 - 2019-03-30
- Fix major problem where Google access token was expired. Detect expired token and reauthenticate. 
- add health check

### v1.1.0 - 2019-03-20
- Change tool to use google drive to access files

### v1.0.0   - 04/2018
- Initial release
- Supported upload and download files

