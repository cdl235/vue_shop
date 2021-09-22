<template>
  <el-container class="home-container">
    <!-- 头部header区域 -->
    <el-header>
      <div>
        <img src="@/assets/logo2.png" alt="" />
        <span>商家后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 内容主体区域 -->
    <el-container>
      <!-- 左边侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 展开收起按钮 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu background-color="rgb(187, 231, 227)" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右边内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      // 左侧菜单的数据
      iconObj: {
        125: 'iconfont  icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-shangpin',
        145: 'iconfont icon-shangpin'
      },
      // 是否被折叠
      isCollapse: false,
      // 被激活的连接地址
      activePath: ''
    }
  },
  methods: {
    // 退出登录
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的侧边栏菜单
    async getNenuList() {
      const { data: res } = await this.$http.get('menus')
      // 如果状态值不为200 就 返回错误信息
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      console.log(res)
    },
    // 点击切换菜单折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存连接激活状态（高亮）
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created() {
    // 获取菜单列表
    this.getNenuList()
    // 把点击的地址保存到本地
    this.activePath = window.sessionStorage.getItem('activePath')
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: rgb(253, 248, 205);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  > div {
    display: flex;
    align-items: center;
    color: rgb(238, 135, 109);
    font-size: 18px;
    img {
      height: 60px;
      border-radius: 50%;
      padding-right: 20px;
    }
  }
  .el-button {
    background-color: rgb(233, 148, 162);
  }
}
.el-container {
  background-color: rgb(187, 231, 227);
}

.el-main {
  background-color: #fff;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: rgb(188, 216, 221);
  color: rgb(170, 166, 166);
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em;
  font-weight: bold;
  cursor: pointer;
}
.el-aside {
  transition: all 0.3s linear;
}
</style>
