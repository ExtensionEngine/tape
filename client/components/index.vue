<template>
  <div class="app-container">
    <header class="app-header">
      <navbar/>
    </header>
    <main class="app-content container">
      <div class="columns">
        <div class="column is-2">
          <sidebar/>
        </div>
        <div class="column is-10">
          <router-view></router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';

export default {
  name: 'admin',
  components: { Navbar, Sidebar }
};
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 32px 0;
}

.app-content {
  flex: 1;
}
</style>
