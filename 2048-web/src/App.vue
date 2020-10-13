<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
@import "./assets/font/font.css";
body {
  margin: 0;
  font-family: "PingFang-RE", "Montserrat-RE", "Microsoft YaHei";
  button,
  input {
    font-family: "PingFang-RE";
  }
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
