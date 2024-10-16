FROM golang:alpine@sha256:cdc86d9f363e8786845bea2040312b4efa321b828acdeb26f393faa864d887b0 as builder

COPY . /usr/src/sriov-cni

ENV HTTP_PROXY $http_proxy
ENV HTTPS_PROXY $https_proxy

WORKDIR /usr/src/sriov-cni
RUN apk add --no-cache --virtual build-dependencies build-base=~0.5 && \
    make clean && \
    make build

FROM alpine:3@sha256:beefdbd8a1da6d2915566fde36db9db0b524eb737fc57cd1367effd16dc0d06d
COPY --from=builder /usr/src/sriov-cni/build/sriov /usr/bin/
WORKDIR /

LABEL io.k8s.display-name="SR-IOV CNI"

COPY ./images/entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]
