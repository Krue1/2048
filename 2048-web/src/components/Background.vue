<template>
  <div class="background">
    <div v-for="i of 16" :key="i" class="grid-cell"></div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.background {
  width: 365px;
  height: 365px;
  padding: 20px;
  background-color: #bbada0;
  border-radius: 10px;
  display: grid;
  grid-row-gap: 15px;
  grid-column-gap: 15px;
  grid-template-columns: repeat(4, 80px);
  grid-template-rows: repeat(4, 80px);

  .grid-cell {
    width: 80px;
    height: 80px;
    border-radius: 5px;
    background-color: #ccc0b3;
  }
}
</style>
