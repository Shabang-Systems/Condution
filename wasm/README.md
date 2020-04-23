# ref-performance - its wasm time!

## Game Plan
### Stage 0: remove cancer
- [x] Add semicolons to app.js
### Stage 1: make sure this is feasible
- [ ] Get wasm working
    - [ ] Figure out how to serve wasm with electron
    - [ ] Load a hello world wasm file into Condution
- [ ] Figure out how to interface with firestore through rust/wasm sandbox
    - [ ] EITHER: Find a (hopefully maintained) library, try
            [firestore-db-and-auth-rs](https://github.com/davidgraeff/firestore-db-and-auth-rs) or
            [firestore1_beta1](https://github.com/Byron/google-apis-rs/tree/master/gen/firestore1_beta1)?
    - [ ] OR: Interact withe firestore's rest api? Jank...
        - [ ] Make sure we can do everything we need with the [api](https://firebase.google.com/docs/projects/api/reference/rest/v1beta1/projects.webApps)
        - [ ] Pressumabily use [reqwest](https://github.com/seanmonstar/reqwest)?
- [ ] Convince jack to use vessels (optional, else use vessels anyways)
    - [(Just kidding, vessels is no where near production ready. But it would be nice to use, when it ripens a little)](vesse.ls).
- [ ] Figure out how to pass objects back and forth between wasm and js
    - [ ] EITHER: serialize with mincodec or something?
    - [ ] OR: this has gotta be a common problem
        - [ ] see [technical details](https://rustwasm.github.io/docs/book/reference/js-ffi.html)
        - [ ] does `wasm-pack` do this for you?
- [ ] Figure out also if React Native supports WASM, otherwise create a way that we could efficiently maintain both the potential new API and WASM with feature parity as JS script
### Stage 2: Rewrite CacheManager.js
- [ ] Write (efficient) query parser in rust
- [ ] Write (efficient) caching system
### Stage 3: Rewrite FirebaseManager.js
- [ ] Refactor app.js to get rid of non-ux logic and put it in the rust
- [ ] Rewrite FirebaseManager.js in rust
### Stage 4: Plug everything in
- [ ] Fix app.js to actually use the new rust wasm backend
