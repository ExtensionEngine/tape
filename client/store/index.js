import Vue from 'vue';
import Vuex from 'vuex';

import { auth as authPlugin } from '@/store/plugins';
import auth from '@/store/modules/auth';
import users from '@/store/modules/users';

const MUTATION_TYPE = 'auth/login';
const isProduction = process.env.NODE_ENV === 'production';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
    users
  },
  plugins: [authPlugin(MUTATION_TYPE)],
  strict: !isProduction
});
