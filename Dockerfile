FROM node:18-alpine
ENV VAULT_ADDR="https://vault-public-vault-577e1858.573e57b9.z1.hashicorp.cloud:8200"
ENV VAULT_NAMESPACE="admin"
WORKDIR /usr/src/app
COPY . .
RUN yarn install
EXPOSE 5000
RUN yarn start
