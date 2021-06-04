#!/bin/bash

#mongorestore --gzip --archive=../capital28_dev_02_02_2021.gz --db c28_dev
BACKUP_FILE_GZ=capital28_dev_02_02_2021.gz
DB_NAME_RESTORE=capital28_dev
DB_NAME=capital28_dev
mongorestore --gzip --db "${DB_NAME_RESTORE}" ../${BACKUP_FILE_GZ}/${DB_NAME}