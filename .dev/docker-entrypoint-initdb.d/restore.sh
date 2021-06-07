#!/bin/bash
BACKUP_FILE_GZ=/dbs/capital28_dev_06_5_2021.gz
DB_NAME_RESTORE=capital28_dev
DB_NAME=capital28_dev
mongorestore --gzip --archive < $BACKUP_FILE_GZ