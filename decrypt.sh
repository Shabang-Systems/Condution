#!/bin/sh

gpg --quiet --batch --yes --decrypt --passphrase="$SECRETS_PASSPHRASE" --output src/backend/secrets.json secrets.json.gpg


