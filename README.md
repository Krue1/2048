# 2048

## 2048-web

@[TOC](基于Vue.js的2048小游戏的设计与实现)

### 游戏规则

1. 游戏盘内有 16 个方格，初始状态是有两个值为 2 或 4 的数字格
2. 指定向 ↑ ↓ ← → 方向滑动，则所有方块都会向该方向滑动
3. 相碰撞的两个数字格的值相等则会将其合并
4. 每次滑动都会在随机空位上生成一个值为 2 或 4 的数字格
5. 若游戏盘的 16 个方格均被填满且无法移动，则判定为游戏失败
6. 若有一数字格的值为 8192，则游戏通关

<hr style=" border:solid; width:100px; height:1px;" color=#000000 size=1">

### 一、准备工作

#### 1. 项目结构

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201014201321226.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDQ2NjY1MQ==,size_16,color_FFFFFF,t_70#pic_center)

#### 2. 入口组件 App.vue

这一块没什么好说的，就是给游戏提供入口，由于想照顾兼容更多情况引入了 vue-router。

我用到了 SCSS 主要是为了让 css 写起来简洁一点，为了好看点，个人习惯用到了苹方字体，可以不必在意。

```html
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
  @import './assets/font/font.css';
  body {
    margin: 0;
    font-family: 'PingFang-RE', 'Montserrat-RE', 'Microsoft YaHei';
    button,
    input {
      font-family: 'PingFang-RE';
    }
  }
  ###app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
</style>
```

#### 3. 路由文件 router -> index.js

这一块没什么好说的，主要是把组件引入进来应用到 App 里面的 router-view

```javascript
import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
```

### 二、界面布局

#### 1. 游戏盘背景 Background.vue

这里我用一个 v-for 循环把 16 个格子展现出来

background 就是用的 Grid 布局，分成四行四列

```html
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
```

#### 2. 游戏界面的头部信息

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201014203916416.png#pic_center)

这里也相当简单，我用一个 header 标签包裹

```html
<header>
  <h1>2048</h1>
  <button @click="init" class="init-button">New Game</button>
  <p>Score: <span>{{ score }}</span></p>
</header>
```

```css
header {
  h1 {
    margin: 0;
    font-size: 32px;
  }
  p {
    margin: 0;
    margin-top: 10px;
    font-size: 16px;
    span {
      font-weight: bold;
    }
  }
}
.init-button {
  width: 110px;
  padding: 10px;
  background-color: #8f7a66;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  font-size: 16px;
  font-weight: bold;
  &:hover {
    background-color: #9f8a77;
  }
}
```

#### 3. 游戏界面主体的编写

用一个 container 包裹

mask 是游戏通关或失败的遮罩

Background 是背景以组件形式引入了的标签

number-cells 是游戏的数字格子，transition-group 是为了给这些格子加过渡动画，数字格我以数组形式存起来然后 v-for 逐个展示出来

```html
<div class="container">
  <div class="mask" v-if="success">
    <h1>You win!</h1>
    <button @click="init" class="init-button">Try again</button>
  </div>
  <div class="mask" v-if="gameover">
    <h1>Game over!</h1>
    <button @click="init" class="init-button">Try again</button>
  </div>
  <Background />
  <div class="number-cells">
    <transition-group name="appear">
      <div
        class="number-cell"
        v-for="cell of numberCells"
        :id="`c${cell.id}`"
        :key="cell.id"
        :style="
          `
      width: 80px;
      height: 80px;
      border-radius: 5px;
      font-size: 32px;
      font-weight: bold;
      line-height: 80px;
      color: #776e65;

      position: absolute;
      z-index: ${cell.num};
      backgroundColor: ${cell.color};
      top: ${getTop(cell)};
      left: ${getLeft(cell)};
      `
        "
      >
        {{ cell.num }}
      </div>
    </transition-group>
  </div>
</div>
```

container 包裹了 background，然后整个容器用 margin 来做水平居中

mask 以 container 为基准做绝对定位，用 top...等定位来拉伸展开

number-cell（数字格子）也是以 container 为基准做绝对定位，top 和 left 的数值通过格子的数据结构计算出。

因为合并时可能会存在大数值的格子需要覆盖小数值的格子，所以以数值来作为 z-index

然后就是用到了 vue 的 transition 以及 CSS3 的 transition，前者是用来在 DOM 生成时的一个从无到有的动画，后者是数字格的滑动

```css
.container {
  width: 405px;
  height: 405px;
  margin: 20px auto;
  position: relative;
  .mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9999;
    background: rgba(238, 228, 218, 0.5);
    text-align: center;
    h1 {
      font-size: 60px;
      font-weight: 700;
      height: 60px;
      line-height: 60px;
      margin-top: 120px;
      color: #776e65;
    }
    button {
      margin-top: 30px;
    }
  }
  .number-cells {
    .number-cell {
      transition: $transitionTime top, $transitionTime left;
      // animation-fill-mode: backwards;
      // animation: appear 200ms ease-in-out;
    }
  }
}
.appear-enter-active {
  animation: appear 100ms ease-in-out;
}
.appear-leave-active {
  transition: $transitionTime top, $transitionTime left;
}
@keyframes appear {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

```javascript
getTop(cell) {
  return `${20 + cell.y * 95}px`;
},
getLeft(cell) {
  return `${20 + cell.x * 95}px`;
},
```

### 三、游戏初始化设置以及数据结构的定义

#### 1. 游戏所需数据

score 记录游戏分数

numberCells 是一个存放数字格的数组，在上面提到数字格是由这个数组生成的

color 就是为了后续获得数字格对应的背景色而定义的

auxId 是一个用来辅助唯一标记数字格的 id 的，后续会介绍

success 是标记游戏是否通关

gameover 标记游戏是否结束

canMove 后面介绍，是一个辅助判断的变量

```javascript
data() {
  return {
    score: 0,
    numberCells: [],
    color: {
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#0444BF',
      1024: '#A79674',
      2048: '#282726',
      4096: '#280b21',
      8192: '#281d04',
    },
    auxId: 0,
    success: false,
    gameover: false,
    canMove: true,
  };
},
```

#### 2. 数字格的数据结构

数字格的坐标用 x 和 y 来标识
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201015120232776.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDQ2NjY1MQ==,size_16,color_FFFFFF,t_70#pic_center)

如图，x 就是横坐标、y 是纵坐标

num 是数字格的数值大小

color 是数字格的背景颜色，这里就是在上述定义的 color 对象里取到了相应数字的背景色

id 是唯一标识该数字格用的，就是用 auxId 来一个格子生成后自增 1

```javascript
const newCell = {
  x: this.random0123(),
  y: this.random0123(),
  num: num,
  color: this.color[num],
  id: this.auxId++,
};
```

#### 3. 游戏的初始化

首先对游戏数据进行初始化

```javascript
init() {
  this.numberCells.length = 0;
  this.score = 0;
  this.auxId = 0;
  this.success = false;
  this.gameover = false;
  this.generateOneNumberCell();
  this.generateOneNumberCell();
},
```

这里就正式开始游戏了，就是先生成两个数字格在游戏盘上

```javascript
generateOneNumberCell() {
  if (this.isFull()) {
    return;
  }
  const num = this.random24();
  const newCell = {
    x: this.random0123(),
    y: this.random0123(),
    num: num,
    color: this.color[num],
    id: this.auxId++,
  };
  let isExist = () => this.getCellByPoint({ x: newCell.x, y: newCell.y });
  while (isExist()) {
    newCell.x = this.random0123();
    newCell.y = this.random0123();
  }
  this.numberCells.push(newCell);
},
random24() {
  //70%概率是2
  return Math.random() <= 0.7 ? 2 : 4;
},
random0123() {
  return parseInt(Math.random() * 4);
},
getCellByPoint({ x, y }) {
  return this.numberCells.find((cell) => cell.x === x && cell.y === y);
},
```

这里的生成逻辑就是先随机生成一个 2 或 4 的数字，然后随机获得 0-3 的坐标值，再去判断当前生成的坐标上有没有其他格子，若有则继续随机生成直至找到一个空位，然后再 push 到数组中。

再结合这个动画就能比较好的完成初始化的工作了

```css
.appear-enter-active {
  animation: appear 100ms ease-in-out;
}
.appear-leave-active {
  transition: $transitionTime top, $transitionTime left;
}
@keyframes appear {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

### 四、游戏逻辑

#### 1. 全局逻辑

在 vue 实例挂载完成后，调用钩子函数给文档添加键盘监听

会有一个全局的 canMove 变量判断当前是否可以移动

每次移动后判断是否通关或失败

```javascript
mounted() {
  this.init();
  document.addEventListener('keyup', (event) => {
    if (!this.canMove) {
      return;
    }
    switch (event.key.toLocaleUpperCase()) {
      case 'ARROWUP':
      case 'W':
        this.moveUp();
        this.success = this.isSuccess();
        this.gameover = this.isGameOver();
        break;
      case 'ARROWDOWN':
      case 'S':
        this.moveDown();
        this.success = this.isSuccess();
        this.gameover = this.isGameOver();
        break;
      case 'ARROWLEFT':
      case 'A':
        this.moveLeft();
        this.success = this.isSuccess();
        this.gameover = this.isGameOver();
        break;
      case 'ARROWRIGHT':
      case 'D':
        this.moveRight();
        this.success = this.isSuccess();
        this.gameover = this.isGameOver();
        break;
    }
  });
},
```

#### 2. 移动逻辑

以向左移动为例，其他方向移动的逻辑也基本相同

向左移动的逻辑如下：

- 最左边的数字格只要向左移动则一定被推向最左
- 其他数字格的移动情况则视其左边的数字格的数值而定
  a. 若当前数字格与左边数字格的数字一样，则合并。已经是合并完成的数字格不得重复合并，如`2 2 4`的排列向左移动应该是`4 4`而非`8`
  b. 将其挪到上一格的后一列

代码实现的辅助函数如下

- sortByX 和 sortByY 函数是用来对数字格的 x 或 y 坐标进行升序排序的
- getIndexById 是通过数字格的 id 返回他在 numberCells 中的下标
- animateMerge 是传入一个 DOM 元素，模拟合并的动画

```javascript
sortByX(a, b) {
  return a.x - b.x;
},
sortByY(a, b) {
  return a.y - b.y;
},
getIndexById(id) {
  return this.numberCells.findIndex((cell) => cell.id === id);
},
animateMerge(dom) {
  dom.animate(
    [
      { transform: 'scale(0)' },
      { transform: 'scale(1.2)' },
      { transform: 'scale(1)' },
    ],
    {
      duration: 150,
    }
  );
  //合并后可以接受键盘输入
  this.canMove = true;
},
```

逐行分析实现逻辑：

- 定义一个表示可以向左移动的变量，若不能向左移动则不会生成新的数字块
- 逐行遍历，首先获取到每行的数字格
- 定义一个表示上一格已经过合并的变量，避免重复合并
- 遍历该行的每一个数字格
  a. 若当前数字格是当前行的第一个格子
  若不在最左一列则移动，标记 canMoveLfet 为 true
  b. 若当前数字格不是当前行的第一个格子 且
  当前数值与上一格的数值相等，则合并两者。
  合并过程是先移动当前数字格到上一数字格的位置。
  在移动过程中阻塞键盘输入将 canMove 设为 false。
  给当前数字格添加一个 transitionend 监听器，执行在移动结束后的操作：
  更新合并后的格子的数值和颜色，并给他加上一个合并动画，设置 canMove 为 true 继续接受键盘输入，然后删除当前格子，更新得分。
  标记 canMoveLeft 为 true，visited 为 true（表示这一格进行过合并了）
  c. 若当前数字格不是当前行的第一个格子 且
  当前数值与上一格的数值不等，则将其移到上一格的后一列
  若当前数字格不在上一格的后一列就进行移动，标记 canMoveLeft 为 true，visited 为 false（这一格没进行合并）
- 若 canMoveLeft 则生成新的数字格

具体实现代码如下

```javascript
moveLeft() {
  //一个表示可以向左移动的变量
  let canMoveLeft = false;
  for (let i = 0; i < 4; i++) {
    //按顺序获得该行的数字格
    let row = this.numberCells
      .filter((cell) => cell.y === i)
      .sort(this.sortByX);
    //一个表示上一格已经过合并的变量
    let visited = false;
    for (let j = 0; j < row.length; j++) {
      //如果当前是第一个数字格，则其左边一定没有数字格，则直接推向最左边
      if (j === 0) {
        //如果已经在最左边则无需变动，也不会把可以移动的变量置为true
        //如果不在最左边则移动
        if (row[j].x !== 0) {
          row[j].x = 0;
          canMoveLeft = true;
        }
      } else {
        //如果当前数字格与上一数字格的数字一样，则合并
        //否则就是将其挪到上一格的后一列，条件是上一格的后一列不为当前格
        if (row[j].num === row[j - 1].num && !visited) {
          //移动当前数字格的坐标到上一数字格上
          row[j].x = row[j - 1].x;
          //滑动中禁止键盘输入
          this.canMove = false;
          //获取当前数字格的DOM
          let dom1 = document.querySelector(`#c${row[j].id}`);
          //给当前数字格一个监听器，在动画结束后再更新合并后的数字格
          dom1.addEventListener(
            'transitionend',
            () => {
              const newNum = row[j].num * 2;
              row[j - 1].num = newNum;
              row[j - 1].color = this.color[newNum];
              let dom2 = document.querySelector(`#c${row[j - 1].id}`);
              this.animateMerge(dom2);
              this.numberCells.splice(this.getIndexById(row[j].id), 1);
              row.splice(j, 1);
              j--;
              this.score += newNum;
            },
            true
          );
          //若发生合并则表示当前可以向左移动，则表示这一格已进行合并，避免重复合并
          canMoveLeft = true;
          visited = true;
        } else {
          if (row[j].x !== row[j - 1].x + 1) {
            row[j].x = row[j - 1].x + 1;
            canMoveLeft = true;
            //如果进行一次无合并的移动，则表示上一格（这一格）没进行合并
            visited = false;
          }
        }
      }
    }
  }
  if (canMoveLeft) {
    this.generateOneNumberCell();
  }
},
```

#### 3. 通关与结束的逻辑

##### 3.1 通关逻辑

这个很简单，只要找到数值为 8192 的数字格则通关

```javascript
isSuccess() {
  return !!this.numberCells.find((cell) => cell.num === 8192);
},
```

##### 3.1 结束逻辑

游戏结束的条件是

1. 游戏盘内 16 个格子均被填满
2. 上下左右四个方向都无法移动

第一个问题很简单，只要数组长度为 16 即可

```javascript
isFull() {
  return this.numberCells.length > 15;
},
```

第二个问题就复杂不少了，我的解法如下
每个格子只需与自己的右边和下边的格子比较，就能覆盖到整个游戏盘
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201018092527397.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NDQ2NjY1MQ==,size_16,color_FFFFFF,t_70#pic_center)

```javascript
isGameOver() {
  //判断是否可以移动
  //思路是看每个格子的右边或下边的格子是否与自己的数值相等
  //因此第四行已经经过了第三行的比较，不用再向下比较
  //第四列的已经经过第三列的比较，不用再向右比较
  let cannotMove = () => {
    for (let i = 0; i < 4; i++) {
      let row = this.numberCells.filter((cell) => cell.y === i);
      for (let j = 0; j < 4; j++) {
        //除第四行外，所有格子跟下一行同一列的格子比较数值是否相等
        if (i < 3) {
          if (row[j].num === this.getCellByPoint({ x: j, y: i + 1 }).num) {
            return false;
          }
        }
        //除第四列外，所有格子跟同一行下一列的格子比较数值是否相等
        if (j < 3) {
          if (row[j].num === row[j + 1].num) {
            return false;
          }
        }
      }
    }
    return true;
  };
  return this.isFull() && cannotMove();
},
```

### 总结

到这里就全部完成咯，目前可能还存在一点 bug，还请大家指出

[预览地址](https://krue1.github.io/2048/2048-web/dist/index.html#/)
