# Changelog

## [0.4.0](https://github.com/bpg/swimstats/compare/v0.3.0...v0.4.0) (2026-01-23)


### ⚠ BREAKING CHANGES

* **ci:** Update actions/attest-build-provenance action (v2 → v3) ([#77](https://github.com/bpg/swimstats/issues/77))

### Miscellaneous

* **ci:** Update actions/attest-build-provenance action (v2 → v3) ([#77](https://github.com/bpg/swimstats/issues/77)) ([de97120](https://github.com/bpg/swimstats/commit/de97120a1b757888f2b76be9899c85244ef23383))
* **ci:** update actions/attest-build-provenance digest (6c21c04 → e8998f9) ([#76](https://github.com/bpg/swimstats/issues/76)) ([511b887](https://github.com/bpg/swimstats/commit/511b887d347bc343320960438cb6263029fa25e6))

## [0.3.0](https://github.com/bpg/swimstats/compare/v0.2.0...v0.3.0) (2026-01-23)


### Features

* **ci:** add SBOM and provenance attestations for Docker images ([#72](https://github.com/bpg/swimstats/issues/72)) ([294b75e](https://github.com/bpg/swimstats/commit/294b75e2a8016cc7006f59fde59513e018825292))


### Miscellaneous

* **docs:** clarify commit convention for documentation changes ([#75](https://github.com/bpg/swimstats/issues/75)) ([858109b](https://github.com/bpg/swimstats/commit/858109b93c7dbe9bddb286b3a310ba1920f9754d))

## [0.2.0](https://github.com/bpg/swimstats/compare/v0.1.0...v0.2.0) (2026-01-23)


### ⚠ BREAKING CHANGES

* **ci:** Update actions/checkout action (v4 → v6) ([#66](https://github.com/bpg/swimstats/issues/66))
* **deps:** Update tailwindcss (3.4.19 → 4.1.18) ([#41](https://github.com/bpg/swimstats/issues/41))
* **deps:** Update eslint (8.57.1 → 9.39.2) ([#35](https://github.com/bpg/swimstats/issues/35))
* **deps:** Update react monorepo (major) ([#37](https://github.com/bpg/swimstats/issues/37))
* **ci:** Update golangci/golangci-lint-action action (v7 → v9) ([#31](https://github.com/bpg/swimstats/issues/31))
* **deps:** Update jsdom (24.1.3 → 27.4.0) ([#36](https://github.com/bpg/swimstats/issues/36))
* **deps:** Update typescript-eslint monorepo (7.18.0 → 8.53.0) ([#42](https://github.com/bpg/swimstats/issues/42))
* **deps:** Update tailwind-merge (2.6.0 → 3.4.0) ([#40](https://github.com/bpg/swimstats/issues/40))
* **deps:** Update react-router-dom (6.30.3 → 7.12.0) ([#38](https://github.com/bpg/swimstats/issues/38))
* **deps:** Update @vitejs/plugin-react (4.7.0 → 5.1.2) ([#34](https://github.com/bpg/swimstats/issues/34))
* **ci:** Update actions/setup-go action (v5 → v6) ([#27](https://github.com/bpg/swimstats/issues/27))
* **ci:** Update actions/setup-node action (v4 → v6) ([#28](https://github.com/bpg/swimstats/issues/28))
* **ci:** Update docker/build-push-action action (v5 → v6) ([#30](https://github.com/bpg/swimstats/issues/30))
* **ci:** Update codecov/codecov-action action (v4 → v5) ([#29](https://github.com/bpg/swimstats/issues/29))
* **container:** Update image node (20.20.0 → 24.13.0) ([#33](https://github.com/bpg/swimstats/issues/33))
* **ci:** Update image postgres (16 → 18) ([#32](https://github.com/bpg/swimstats/issues/32))
* **deps:** Update recharts (2.15.4 → 3.6.0) ([#39](https://github.com/bpg/swimstats/issues/39))
* **deps:** Update zustand (4.5.7 → 5.0.10) ([#43](https://github.com/bpg/swimstats/issues/43))
* **ci:** Update actions/checkout action (v4 → v6) ([#26](https://github.com/bpg/swimstats/issues/26))

### Features

* Add accessibility testing with axe-core ([#7](https://github.com/bpg/swimstats/issues/7)) ([62c6efe](https://github.com/bpg/swimstats/commit/62c6efebf7de39fd7c089ce1a48e2b9dd8987ab0))
* Add data import system and enhance comparison UI ([0d1363c](https://github.com/bpg/swimstats/commit/0d1363c915cf01fc9bfb4f77271ffbc1bf15ccff))
* Add delete time functionality to Meet Details page ([9082df7](https://github.com/bpg/swimstats/commit/9082df74126c587ae951d2cb02878e417bce0bf9))
* Add JSON bulk import for time standards ([fe2051e](https://github.com/bpg/swimstats/commit/fe2051e87b4a74d26b583a82b7d8b16ba0c223bf))
* Add multi-day meet support with event date selection ([64313e9](https://github.com/bpg/swimstats/commit/64313e9a3834644e0d637fe42c872fc3ec7a1811))
* Add one-event-per-meet validation ([d1f58c3](https://github.com/bpg/swimstats/commit/d1f58c36fe28457bb2716f291cb5b98fba39c367))
* add Quick Add Meet option to time entry form ([3badd63](https://github.com/bpg/swimstats/commit/3badd633baa911825948847580dd7428496271f0))
* Add save feedback and Meet details page ([48ac862](https://github.com/bpg/swimstats/commit/48ac86263a6bd9046b881ec10cd0f4adebba5d47))
* add Settings button to navigation ([38e1563](https://github.com/bpg/swimstats/commit/38e1563ab21a29ea8a0064b0fb5973e41fddcc3e))
* add swimmer profile editor to Settings page ([d7dbad6](https://github.com/bpg/swimstats/commit/d7dbad6dd8a270d79745426669b81d5ba8436011))
* **ci:** add release-please workflow for automated releases ([#69](https://github.com/bpg/swimstats/issues/69)) ([4bf21b8](https://github.com/bpg/swimstats/commit/4bf21b8be50f706dcd4c0748f33eb5fd0838b29b))
* complete Phase 2 foundational infrastructure ([4606c1f](https://github.com/bpg/swimstats/commit/4606c1f174b190ac35443cf5412ee774cc43f880))
* enhance comparison UI and reorder navigation ([ddbade1](https://github.com/bpg/swimstats/commit/ddbade18d479276942f52df8da12affd2387968e))
* Filter out already-entered events from event selector dropdown ([3309606](https://github.com/bpg/swimstats/commit/330960635087fa01554c08194e928e469981e7bc))
* **frontend:** add All Times page with event filter and PB badges ([4d5b43e](https://github.com/bpg/swimstats/commit/4d5b43e86d83db8ac66647542dff3d1a5dcef971))
* **frontend:** implement US1 components and pages ([7e94dec](https://github.com/bpg/swimstats/commit/7e94dec02012487c89e55c95ecde2d94dfa7afab))
* **frontend:** replace nginx with caddy for static serving ([#68](https://github.com/bpg/swimstats/issues/68)) ([a3cd214](https://github.com/bpg/swimstats/commit/a3cd21436da430fb6b69d4aa36d2207a20a4d590))
* Implement data export functionality (Phase 8 - T180-T184) ([f21131a](https://github.com/bpg/swimstats/commit/f21131a78e51bb32d59e5e94ca7a988cd2960bcd))
* Implement progress charts visualization (Phase 7) ([8b0b6ac](https://github.com/bpg/swimstats/commit/8b0b6acc38b34137da555eeade9c5dcf2b0d9ef3))
* Implement symmetrical import with preview and replace mode ([1fb0d54](https://github.com/bpg/swimstats/commit/1fb0d54824b68555df5fee4ad89d401e3eb759a6))
* Implement Time Standards management (Phase 5 - US3) ([49d64f6](https://github.com/bpg/swimstats/commit/49d64f69ac02a9e09538a3f7ceea2ffcb569ac5f))
* Improve standard reference line visibility on progress chart ([ec00579](https://github.com/bpg/swimstats/commit/ec00579237c19dc4907241306c3e19ad75a5bd2f))
* scaffold project structure and core infrastructure ([7184b8c](https://github.com/bpg/swimstats/commit/7184b8cc907c3047531fe9efea8f8f805e20bd46))
* **US1:** implement backend for swim time recording ([e711ff0](https://github.com/bpg/swimstats/commit/e711ff002211e7abf8b5f46d98c3a9bd40a767aa))
* **US1:** implement frontend types, services, and hooks ([18cbd0b](https://github.com/bpg/swimstats/commit/18cbd0b193d6c164cf9492aede10e73b98658a6e))
* **US2:** implement View Personal Bests ([110fbca](https://github.com/bpg/swimstats/commit/110fbca73fb0905f1f7168aab0aad6e69479303e))


### Bug Fixes

* add /time-history route alias for time history page ([e44af78](https://github.com/bpg/swimstats/commit/e44af7816f4f6893d26f9daf656b9b132cf0febb))
* Adjust standard time label position to avoid line intersection ([43ebbe7](https://github.com/bpg/swimstats/commit/43ebbe756b2e953397f95906b0884cea2fedf7a9))
* **backend:** fix personal bests API test isolation and request ID generation ([f1c09cd](https://github.com/bpg/swimstats/commit/f1c09cd41450393a36b87b6420e07b4cdde22815))
* base64 encode X-Mock-User header to avoid proxy errors ([5c22f48](https://github.com/bpg/swimstats/commit/5c22f487c8f7e7f72d4eef134a0304e0cee410c7))
* Delete time - invalidate meets query and use inline confirmation ([8e0caa3](https://github.com/bpg/swimstats/commit/8e0caa317fe07a5dbbf4183c9acd6301888cb4e8))
* Handle inconsistent auth state on store rehydration ([b6c3300](https://github.com/bpg/swimstats/commit/b6c33002eac5a9519230af88f9528cec8d69d854))
* Improve Progress page filters layout and standard reference functionality ([886d144](https://github.com/bpg/swimstats/commit/886d1443696654d2d2c6b88f1aa87839ac119652))
* only show meet count when &gt; 0 ([23abe89](https://github.com/bpg/swimstats/commit/23abe89f0f5520739e79b6bb98ee9457f431860b))
* persist user object in authStore ([1e11acd](https://github.com/bpg/swimstats/commit/1e11acdca47443cb481bd30af289781de2930a37))
* Pin golangci-lint to v2.0.2 in CI workflow ([2c035b6](https://github.com/bpg/swimstats/commit/2c035b63d6c06ddb36a74ee8c2e718ee827d5031))
* prevent '0' rendering in TimeHistory title ([50663cc](https://github.com/bpg/swimstats/commit/50663cc44b45921be4c84e0056b1c0c24e74cdd6))
* prevent React rendering '0' in MeetList title ([b578d8c](https://github.com/bpg/swimstats/commit/b578d8c23b057cc20c51079575786c0f3e55b2df))
* Quick Entry form alignment - use column headers instead of per-row labels ([2488115](https://github.com/bpg/swimstats/commit/2488115f54359b7042387f4ad06a1c0b66167162))
* Remove "All Events" option from All Times page ([4786ad6](https://github.com/bpg/swimstats/commit/4786ad661a8ca9ed3066eb3ad91c1cb39b22c52c))
* Remove duplicate Course label and add logout icon ([f8f16ca](https://github.com/bpg/swimstats/commit/f8f16ca86595718fba4ac7edb913a1e8a7dfe8fe))
* **renovate:** enable custom managers for golangci-lint version tracking ([#53](https://github.com/bpg/swimstats/issues/53)) ([f8e8220](https://github.com/bpg/swimstats/commit/f8e82206c802547f434994676b50d53c95d97aad))
* Replace browser alert with in-app success/error dialogs ([6a8802e](https://github.com/bpg/swimstats/commit/6a8802e2851603374cf38b66e79e9ff56ab800d4))
* Resolve CI lint and test errors ([0b46ab8](https://github.com/bpg/swimstats/commit/0b46ab8156827418096b51492ea842d91cd86f77))
* Run database migrations before backend tests in CI ([ad69822](https://github.com/bpg/swimstats/commit/ad698224d816352aa05dab5f8a4330b317559feb))
* Simplify standard reference line label on progress chart ([f48c0d4](https://github.com/bpg/swimstats/commit/f48c0d4efbc1cf3c59f6304545c51e62ddbc5983))
* Update dependencies to resolve security vulnerabilities ([7e0976d](https://github.com/bpg/swimstats/commit/7e0976db1ae297fe574cea6ddcbda33af8da4010))
* Update Dockerfile to use Go 1.24 ([0f50dca](https://github.com/bpg/swimstats/commit/0f50dca330c5312663c415f0a13f3d941cca9f09))
* Update golangci-lint config to valid v2 schema format ([68e89a1](https://github.com/bpg/swimstats/commit/68e89a1a02d2084d505f5bd94241a320f5c87562))
* Update golangci-lint-action to v7 for golangci-lint v2 support ([944ce64](https://github.com/bpg/swimstats/commit/944ce642ec2cd111224f3378f25287ed5bc8c250))
* Update test-import.sh to work with new import API format ([f8fd420](https://github.com/bpg/swimstats/commit/f8fd420a59b4ccb8f6dce1cb9aed5476c69084d3))
* wire up integration tests with real API handlers ([0f893e9](https://github.com/bpg/swimstats/commit/0f893e9f81290d9086ddc40f670bfcb90117785b))


### Miscellaneous

* add Makefiles for backend and frontend CI/CD processes ([#44](https://github.com/bpg/swimstats/issues/44)) ([d25e65c](https://github.com/bpg/swimstats/commit/d25e65c1bfd25c0180ef13710d69151310c7ba70))
* **ci:** Update actions/checkout action (v4 → v6) ([#26](https://github.com/bpg/swimstats/issues/26)) ([208a79b](https://github.com/bpg/swimstats/commit/208a79bd79c091a578ea9752f36c2f177a47f210))
* **ci:** Update actions/checkout action (v4 → v6) ([#66](https://github.com/bpg/swimstats/issues/66)) ([df43f69](https://github.com/bpg/swimstats/commit/df43f69987520c93aeca8846f4cde22cf6421966))
* **ci:** update actions/checkout digest (11bd719 → 34e1148) ([#57](https://github.com/bpg/swimstats/issues/57)) ([abb65bd](https://github.com/bpg/swimstats/commit/abb65bdd442394e385e7faa69412cd6520de70f1))
* **ci:** Update actions/setup-go action (v5 → v6) ([#27](https://github.com/bpg/swimstats/issues/27)) ([3142e78](https://github.com/bpg/swimstats/commit/3142e78aae8fee1663380b2558b4b19f26d50a6c))
* **ci:** Update actions/setup-node action (v4 → v6) ([#28](https://github.com/bpg/swimstats/issues/28)) ([fc99f06](https://github.com/bpg/swimstats/commit/fc99f06d8933a0e3190c572641b5dd38eddbd06a))
* **ci:** Update codecov/codecov-action action (v4 → v5) ([#29](https://github.com/bpg/swimstats/issues/29)) ([0dc71ac](https://github.com/bpg/swimstats/commit/0dc71ac09d7e8b6e4089c127fe2888ce8308ef6e))
* **ci:** Update docker/build-push-action action (v5 → v6) ([#30](https://github.com/bpg/swimstats/issues/30)) ([c3b390e](https://github.com/bpg/swimstats/commit/c3b390e2a2c0053cf3b8a9aa96ec4f77bacbfaa0))
* **ci:** update docker/login-action digest (74a5d14 → 5e57cd1) ([#58](https://github.com/bpg/swimstats/issues/58)) ([3ded8fb](https://github.com/bpg/swimstats/commit/3ded8fbc524f5375412c95d41d5d877d45dd7923))
* **ci:** update docker/metadata-action digest (902fa8e → c299e40) ([#59](https://github.com/bpg/swimstats/issues/59)) ([0425d7d](https://github.com/bpg/swimstats/commit/0425d7d12700c6602cd65862b4147cd507ddf041))
* **ci:** update docker/setup-buildx-action digest (b5ca514 → 8d2750c) ([#60](https://github.com/bpg/swimstats/issues/60)) ([5754aa9](https://github.com/bpg/swimstats/commit/5754aa9e21e6daca2c8cad0d521c91741d72ca2c))
* **ci:** update docker/setup-qemu-action digest (2910929 → c7c5346) ([#61](https://github.com/bpg/swimstats/issues/61)) ([d8262f4](https://github.com/bpg/swimstats/commit/d8262f488307288ba584f689ac65b13e9bfd4141))
* **ci:** Update golangci/golangci-lint-action action (v7 → v9) ([#31](https://github.com/bpg/swimstats/issues/31)) ([cf1ecf8](https://github.com/bpg/swimstats/commit/cf1ecf8ea24910dc8332ae38e57343db0a8fbc7f))
* **ci:** Update image postgres (16 → 18) ([#32](https://github.com/bpg/swimstats/issues/32)) ([956c2d8](https://github.com/bpg/swimstats/commit/956c2d8c105c71d06cd5f04ceea09a97b6da057e))
* **config:** migrate config renovate.json ([#46](https://github.com/bpg/swimstats/issues/46)) ([d6212c7](https://github.com/bpg/swimstats/commit/d6212c7c9559e511fadebe1838956883a1be6d14))
* **config:** migrate config renovate.json ([#54](https://github.com/bpg/swimstats/issues/54)) ([675411d](https://github.com/bpg/swimstats/commit/675411dcfe3ed53a3a19c1dd320ff927ebc6912f))
* **container:** update image alpine (3.20 → 3.23) ([#19](https://github.com/bpg/swimstats/issues/19)) ([e9831d2](https://github.com/bpg/swimstats/commit/e9831d2cbe4cf82c382e0ad34e7869c590ed8a60))
* **container:** update image golang (1.24 → 1.25) ([#20](https://github.com/bpg/swimstats/issues/20)) ([7052822](https://github.com/bpg/swimstats/commit/7052822287a17bf024c0db21878b2d15c02d8e1a))
* **container:** update image migrate/migrate (v4.17.0 → v4.19.1) ([#21](https://github.com/bpg/swimstats/issues/21)) ([c7823f1](https://github.com/bpg/swimstats/commit/c7823f1c671da76ccd17f2bce20f1fe654b5e6af))
* **container:** update image nginx (1.26 → 1.29) ([#22](https://github.com/bpg/swimstats/issues/22)) ([85039a9](https://github.com/bpg/swimstats/commit/85039a99f8319149e0c0fd9020955a58ad094805))
* **container:** Update image node (20.20.0 → 24.13.0) ([#33](https://github.com/bpg/swimstats/issues/33)) ([3867647](https://github.com/bpg/swimstats/commit/38676474dc5344b2e25b669bc4b68620b4bdb591))
* **deps-dev:** bump lodash-es ([#56](https://github.com/bpg/swimstats/issues/56)) ([97d6c7e](https://github.com/bpg/swimstats/commit/97d6c7e4421658eaeedf331a7e2521544fa7b0ad))
* **deps:** add renovate.json ([#12](https://github.com/bpg/swimstats/issues/12)) ([56765d2](https://github.com/bpg/swimstats/commit/56765d2aab9694b24dd1934a2e4eb233a5a192e9))
* **deps:** bump the npm_and_yarn group across 1 directory with 2 updates ([#5](https://github.com/bpg/swimstats/issues/5)) ([8cff8ea](https://github.com/bpg/swimstats/commit/8cff8ea5f78fd5cd7ee5d9a461a1ad6a28dfe101))
* **deps:** pin dependencies ([#15](https://github.com/bpg/swimstats/issues/15)) ([c0a6cc2](https://github.com/bpg/swimstats/commit/c0a6cc254ae8695e56fa5ca70493d8b507c24506))
* **deps:** pin dependencies ([#16](https://github.com/bpg/swimstats/issues/16)) ([7c3a8c7](https://github.com/bpg/swimstats/commit/7c3a8c7c4517ce51f0969f88853bcc3f25de07c2))
* **deps:** pin dependencies ([#48](https://github.com/bpg/swimstats/issues/48)) ([fc35509](https://github.com/bpg/swimstats/commit/fc35509da4bbbb83c2ecbefbe2624fe7b18d2353))
* **deps:** update @testing-library/react (16.3.1 → 16.3.2) ([#17](https://github.com/bpg/swimstats/issues/17)) ([a008d54](https://github.com/bpg/swimstats/commit/a008d54eeb563de13ee80b014fd4397f729f91a1))
* **deps:** update @types/node (25.0.9 → 25.0.10) ([#62](https://github.com/bpg/swimstats/issues/62)) ([05bc1c8](https://github.com/bpg/swimstats/commit/05bc1c8bbc403359b51ce6b05d004ae39b566f09))
* **deps:** update @types/react (19.2.8 → 19.2.9) ([#49](https://github.com/bpg/swimstats/issues/49)) ([bbb668f](https://github.com/bpg/swimstats/commit/bbb668fdae91d75d3a7a000839a95d35ef5aae5e))
* **deps:** Update @vitejs/plugin-react (4.7.0 → 5.1.2) ([#34](https://github.com/bpg/swimstats/issues/34)) ([84c70b6](https://github.com/bpg/swimstats/commit/84c70b6597ba35abffe81fd4f35615f6e7e4d8d0))
* **deps:** Update eslint (8.57.1 → 9.39.2) ([#35](https://github.com/bpg/swimstats/issues/35)) ([3c8520b](https://github.com/bpg/swimstats/commit/3c8520b1dc20911a9446a8bf3ce948fa1030b9c6))
* **deps:** update globals (17.0.0 → 17.1.0) ([#67](https://github.com/bpg/swimstats/issues/67)) ([0f04f12](https://github.com/bpg/swimstats/commit/0f04f129194931e6849345c85ae4ac5edbfa1f19))
* **deps:** Update jsdom (24.1.3 → 27.4.0) ([#36](https://github.com/bpg/swimstats/issues/36)) ([dd5bc06](https://github.com/bpg/swimstats/commit/dd5bc06b529a7170d102894af14fab8dd006315f))
* **deps:** update module github.com/coreos/go-oidc/v3 (v3.10.0 → v3.17.0) ([#23](https://github.com/bpg/swimstats/issues/23)) ([2fc8aa8](https://github.com/bpg/swimstats/commit/2fc8aa89c60d78b9510bf499b5349645b2993b7e))
* **deps:** update module github.com/go-chi/cors (v1.2.1 → v1.2.2) ([#18](https://github.com/bpg/swimstats/issues/18)) ([ba5f534](https://github.com/bpg/swimstats/commit/ba5f5348c1735f0df0a1d1f1fee07bda52778491))
* **deps:** update module github.com/jackc/pgx/v5 (v5.6.0 → v5.8.0) ([#24](https://github.com/bpg/swimstats/issues/24)) ([92ce991](https://github.com/bpg/swimstats/commit/92ce991fbda0c7599e72304917d506fd79334c2b))
* **deps:** update prettier (3.8.0 → 3.8.1) ([#63](https://github.com/bpg/swimstats/issues/63)) ([af1ef15](https://github.com/bpg/swimstats/commit/af1ef15f0611dfb6398862342a997345946df5a6))
* **deps:** Update react monorepo (major) ([#37](https://github.com/bpg/swimstats/issues/37)) ([43454a0](https://github.com/bpg/swimstats/commit/43454a067e112758cfbbad155e8649a2789610b8))
* **deps:** Update react-router-dom (6.30.3 → 7.12.0) ([#38](https://github.com/bpg/swimstats/issues/38)) ([dc0b927](https://github.com/bpg/swimstats/commit/dc0b927af7e17e2c01b7068b67ffc7148d6a446e))
* **deps:** Update recharts (2.15.4 → 3.6.0) ([#39](https://github.com/bpg/swimstats/issues/39)) ([83b51a3](https://github.com/bpg/swimstats/commit/83b51a384af4455da9d9787a95e1dc575ff2be66))
* **deps:** update recharts (3.6.0 → 3.7.0) ([#65](https://github.com/bpg/swimstats/issues/65)) ([8a9a5bd](https://github.com/bpg/swimstats/commit/8a9a5bdc488da3358bec8d9a5e4e8dc6ac8dcc80))
* **deps:** update renovate configuration for GitHub integration ([#14](https://github.com/bpg/swimstats/issues/14)) ([8278ac2](https://github.com/bpg/swimstats/commit/8278ac24e32f6b642cf339f1b169cb8e0b7f5323))
* **deps:** Update tailwind-merge (2.6.0 → 3.4.0) ([#40](https://github.com/bpg/swimstats/issues/40)) ([8561725](https://github.com/bpg/swimstats/commit/85617253d96143dc36c37e6f6007983bb166601e))
* **deps:** Update tailwindcss (3.4.19 → 4.1.18) ([#41](https://github.com/bpg/swimstats/issues/41)) ([76a1525](https://github.com/bpg/swimstats/commit/76a152505151ae98752eb95315a7e4eddb0e832a))
* **deps:** Update typescript-eslint monorepo (7.18.0 → 8.53.0) ([#42](https://github.com/bpg/swimstats/issues/42)) ([0ec4f9a](https://github.com/bpg/swimstats/commit/0ec4f9a95b581a6c8abe31427f7ec50d67e94c72))
* **deps:** update typescript-eslint monorepo (8.53.0 → 8.53.1) ([#50](https://github.com/bpg/swimstats/issues/50)) ([e0828e8](https://github.com/bpg/swimstats/commit/e0828e810181adcc57cce2bf6e37311fbf6d12ca))
* **deps:** update vitest monorepo (4.0.17 → 4.0.18) ([#64](https://github.com/bpg/swimstats/issues/64)) ([4877f51](https://github.com/bpg/swimstats/commit/4877f51f68f1069607811570bf7b041aa1652026))
* **deps:** Update zustand (4.5.7 → 5.0.10) ([#43](https://github.com/bpg/swimstats/issues/43)) ([12a188c](https://github.com/bpg/swimstats/commit/12a188caf4f99a44eca34120412fa2458cb13d9e))
* **docker:** optimize build stages with cache mounts for dependencies ([#51](https://github.com/bpg/swimstats/issues/51)) ([6cdc298](https://github.com/bpg/swimstats/commit/6cdc298cf018aa2f619b19c26dd518d634673f62))
* update golangci-lint version to v2.8.0 and enhance Renovate configuration ([#45](https://github.com/bpg/swimstats/issues/45)) ([de31445](https://github.com/bpg/swimstats/commit/de31445263915d79d3058cbb65db04d49e65ca59))
* update task completion status ([88df3cd](https://github.com/bpg/swimstats/commit/88df3cd837c51df6099fcabd7deee7616a9a97db))
