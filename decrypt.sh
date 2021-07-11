#!/bin/sh
gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_PASSPHRASE" --output src/backend/secrets.json .secrets/secrets.json.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_PASSPHRASE" --output id_rsa .secrets/id_rsa.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_PASSPHRASE" --output electron/.env .secrets/env.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_PASSPHRASE" --output android/app/upload.jks .secrets/upload.jks.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_PASSPHRASE" --output upload.jks .secrets/upload.jks.gpg

gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_PASSPHRASE" --output playstore_creds.json .secrets/playstore_creds.json.gpg
