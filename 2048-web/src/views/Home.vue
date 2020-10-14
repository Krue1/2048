<template>
  <div class="home">
    <header>
      <h1>2048</h1>
      <button @click="init" class="init-button">New Game</button>
      <p>
        Score: <span>{{ score }}</span>
      </p>
    </header>

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
  </div>
</template>

<style lang="scss" scoped>
$transitionTime: 100ms;
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
</style>

<script>
import Background from '@/components/Background';
export default {
  name: 'Home',
  components: {
    Background,
  },
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
  methods: {
    init() {
      this.numberCells.length = 0;
      this.score = 0;
      this.auxId = 0;
      this.success = false;
      this.gameover = false;
      this.generateOneNumberCell();
      this.generateOneNumberCell();
    },
    generateOneNumberCell() {
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
    getTop(cell) {
      return `${20 + cell.y * 95}px`;
    },
    getLeft(cell) {
      return `${20 + cell.x * 95}px`;
    },
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

              // const newNum = row[j].num * 2;
              // row[j - 1].num = newNum;
              // row[j - 1].color = this.color[newNum];
              // this.numberCells.splice(this.getIndexById(row[j].id), 1);
              // row.splice(j, 1);
              // j--;
              // canMoveLeft = true;
              // visited = true;
              // this.score += newNum;
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
    moveRight() {
      //一个表示可以向右移动的变量
      let canMoveRight = false;
      for (let i = 0; i < 4; i++) {
        //按顺序获得该行的数字格
        let row = this.numberCells
          .filter((cell) => cell.y === i)
          .sort(this.sortByX);
        //一个表示上一格已经过合并的变量
        let visited = false;
        for (let j = row.length - 1; j >= 0; j--) {
          //如果当前是最后一个数字格，则其右边一定没有数字格，则直接推向最右边
          if (j === row.length - 1) {
            //如果已经在最右边则无需变动，也不会把可以移动的变量置为true
            //如果不在最右边则移动
            if (row[j].x !== 3) {
              row[j].x = 3;
              canMoveRight = true;
            }
          } else {
            //如果当前数字格与后一数字格的数字一样，则合并
            //否则就是将其挪到后一格的前一列，条件是后一格的前一列不为当前格
            if (row[j].num === row[j + 1].num && !visited) {
              row[j].x = row[j + 1].x;
              //滑动中禁止键盘输入
              this.canMove = false;

              let dom1 = document.querySelector(`#c${row[j].id}`);
              dom1.addEventListener(
                'transitionend',
                () => {
                  const newNum = row[j].num * 2;
                  row[j + 1].num = newNum;
                  row[j + 1].color = this.color[newNum];
                  let dom2 = document.querySelector(`#c${row[j + 1].id}`);
                  this.animateMerge(dom2);
                  this.numberCells.splice(this.getIndexById(row[j].id), 1);
                  row.splice(j, 1);
                  this.score += newNum;
                },
                true
              );
              canMoveRight = true;
              visited = true;
            } else {
              if (row[j].x !== row[j + 1].x - 1) {
                row[j].x = row[j + 1].x - 1;
                canMoveRight = true;
                //如果进行一次无合并的移动，则表示上一格（这一格）没进行合并
                visited = false;
              }
            }
          }
        }
      }
      if (canMoveRight) {
        this.generateOneNumberCell();
      }
    },
    moveUp() {
      //一个表示可以向上移动的变量
      let canMoveUp = false;
      for (let i = 0; i < 4; i++) {
        //按顺序获得该列的数字格
        let column = this.numberCells
          .filter((cell) => cell.x === i)
          .sort(this.sortByY);
        //一个表示上一格已经过合并的变量
        let visited = false;
        for (let j = 0; j < column.length; j++) {
          //如果当前是第一个数字格，则其上边一定没有数字格，则直接推向最上边
          if (j === 0) {
            //如果已经在最上边则无需变动，也不会把可以移动的变量置为true
            //如果不在最上边则移动
            if (column[j].y !== 0) {
              column[j].y = 0;
              canMoveUp = true;
            }
          } else {
            //如果当前数字格与上一数字格的数字一样，则合并
            //否则就是将其挪到上一格的后一行，条件是上一格的后一行不为当前格
            if (column[j].num === column[j - 1].num && !visited) {
              column[j].y = column[j - 1].y;
              //滑动中禁止键盘输入
              this.canMove = false;

              let dom1 = document.querySelector(`#c${column[j].id}`);
              dom1.addEventListener(
                'transitionend',
                () => {
                  const newNum = column[j].num * 2;
                  column[j - 1].num = newNum;
                  column[j - 1].color = this.color[newNum];
                  let dom2 = document.querySelector(`#c${column[j - 1].id}`);
                  this.animateMerge(dom2);
                  this.numberCells.splice(this.getIndexById(column[j].id), 1);
                  column.splice(j, 1);
                  j--;
                  this.score += newNum;
                },
                true
              );
              canMoveUp = true;
              visited = true;
            } else {
              if (column[j].y !== column[j - 1].y + 1) {
                column[j].y = column[j - 1].y + 1;
                canMoveUp = true;
                //如果进行一次无合并的移动，则表示上一格（这一格）没进行合并
                visited = false;
              }
            }
          }
        }
      }
      if (canMoveUp) {
        this.generateOneNumberCell();
      }
    },
    moveDown() {
      //一个表示可以向下移动的变量
      let canMoveDown = false;
      for (let i = 0; i < 4; i++) {
        //按顺序获得该列的数字格
        let column = this.numberCells
          .filter((cell) => cell.x === i)
          .sort(this.sortByY);
        //一个表示上一格已经过合并的变量
        let visited = false;
        for (let j = column.length - 1; j >= 0; j--) {
          //如果当前是最后一个数字格，则其下边一定没有数字格，则直接推向最下边
          if (j === column.length - 1) {
            //如果已经在最后边则无需变动，也不会把可以移动的变量置为true
            //如果不在最后边则移动
            if (column[j].y !== 3) {
              column[j].y = 3;
              canMoveDown = true;
            }
          } else {
            //如果当前数字格与下一数字格的数字一样，则合并
            //否则就是将其挪到下一格的前一行，条件是下一格的前一行不为当前格
            if (column[j].num === column[j + 1].num && !visited) {
              column[j].y = column[j + 1].y;
              //滑动中禁止键盘输入
              this.canMove = false;

              let dom1 = document.querySelector(`#c${column[j].id}`);
              dom1.addEventListener(
                'transitionend',
                () => {
                  const newNum = column[j].num * 2;
                  column[j + 1].num = newNum;
                  column[j + 1].color = this.color[newNum];
                  let dom2 = document.querySelector(`#c${column[j + 1].id}`);
                  this.animateMerge(dom2);
                  this.numberCells.splice(this.getIndexById(column[j].id), 1);
                  column.splice(j, 1);
                  this.score += newNum;
                },
                true
              );
              canMoveDown = true;
              visited = true;
            } else {
              if (column[j].y !== column[j + 1].y - 1) {
                column[j].y = column[j + 1].y - 1;
                canMoveDown = true;
                //如果进行一次无合并的移动，则表示上一格（这一格）没进行合并
                visited = false;
              }
            }
          }
        }
      }
      if (canMoveDown) {
        this.generateOneNumberCell();
      }
    },
    isFull() {
      return this.numberCells.length > 15;
    },
    isSuccess() {
      return !!this.numberCells.find((cell) => cell.num === 8192);
    },
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
  },
};
</script>
