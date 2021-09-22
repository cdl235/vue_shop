<template>
  <div class="login_container">
    <transition name="el-zoom-in-top">
      <div class="login_box" v-show="show2">
        <!-- 头像模块 -->
        <div class="avatar_box">
          <img src="@/assets/1.webp" alt="" />
        </div>
        <!-- 表单模块 -->
        <el-form :model="loginFrom" :rules="loginFromRules" ref="loginFromRef" class="login_from">
          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input v-model="loginFrom.username" prefix-icon="iconfont icon-yonghu"></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input v-model="loginFrom.password" prefix-icon="iconfont icon-mima" type="password"></el-input>
          </el-form-item>
          <!-- 按钮区域 -->
          <el-form-item class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetLoginFrom">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表单登录数据绑定对象
      loginFrom: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则
      loginFromRules: {
        // 用户名检验是否合法
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '用户名长度为 3 到 8 个字符', trigger: 'blur' }
        ],
        // 密码检验是否合法
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度为 6 到 15 个字符', trigger: 'blur' }
        ]
      },
      show2: false
    }
  },
  mounted() {
    this.showBox()
  },
  methods: {
    // 重置表单
    resetLoginFrom() {
      this.$refs.loginFromRef.resetFields()
    },
    // 登录操作
    login() {
      this.$refs.loginFromRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginFrom)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('恭喜登录成功！')
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    },
    showBox() {
      this.show2 = true
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #aabbcc;
  height: 100%;
  transform: tran;
}
.login_box {
  width: 450px;
  height: 300px;
  border-radius: 5px;
  background-color: #fff;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: all 2s linear;

  .avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    transform: translate(-50%, -50%);
    left: 50%;
    background-color: rgb(188, 209, 212);
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .login_from {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
  }
  .btns {
    display: flex;
    // 弹性盒模型 尾部对其
    justify-content: flex-end;
  }
}
</style>
