<template>
  <div>
    <el-row>
      <el-col>
        <span class="title">欢迎访问今晚打老虎的电商后台项目</span>
      </el-col>
    </el-row>
    <el-row>
      <span class="text">官方微信二维码如下<i class="el-icon-bottom"></i></span>
    </el-row>
    <el-row>
      <div style="width:100%" class="images">
        <img src="../assets/logo3.png" alt="" />
      </div>
    </el-row>
    <el-row align="center">
      <el-col
        ><el-link href="https://gitee.com/nihaoccc/vue_shop" type="primary" :underline="false">这里是码云项目部署地址 <i class="el-icon-view el-icon--right"></i></el-link>
      </el-col>
      <el-col>
        <el-link href="https://github.com/cdl235 " type="success" :underline="false">这里是GitHub的个人网址! <i class="el-icon-view el-icon--right"></i></el-link>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {}
</script>

<style lang="less" scoped>
.title {
  display: block;
  font-size: 28px;
  margin-top: 40px;
  text-align: center;
  color: rgb(139, 63, 139);
  font-weight: 700;
}
.text {
  margin: 20px 0;
  display: block;
  font-size: 18px;
  color: rgb(143, 203, 231);
  text-align: center;
}
img {
  width: 300px;
}
.images {
  display: inline-block;
  text-align: center;
}
.el-link {
  display: block;
  text-align: center;
  margin: 15px 0;
}
</style>
