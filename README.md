# test-remote-cms-contents

nuxt-content でリモート CMS のコンテンツを利用するための実験用コマンド。


## 概要

microCMS からコンテンツをダウンロードして nuxt-content で扱えることは確認できた。

今後は「[nuxt-content でリモート CMS のコンテンツを利用する](https://hankei6km.github.io/mardock/deck/nuxt-content-and-remote-cms)」で得たノウハウを元に別途作り直す予定。

## 簡単な使い方

1. `api-scheme/api-pages.json` で API を作成。
1. 以下のコマンドでコンテンツを保存。

```console
$ npm run start -- save --apiName <api name>--apiBaseURL https://<service name>.microcms.io/ --getApiKey xxxxxxxx content/remote/
```



## ライセンス

MIT License

Copyright (c) 2021 hankei6km
