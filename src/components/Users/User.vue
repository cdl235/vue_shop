<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
      <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" round @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户表单区域 -->
      <el-table :data="userlist" stripe border="">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <!-- 使用作用域插槽  -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"> </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="175px">
          <template slot-scope="scope">
            <!--修改用户信息 -->
            <el-button type="success" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 角色修改 -->
            <el-tooltip effect="dark" content="角色设置" placement="top-start" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="roleSetting(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <!-- current-page 当前的页数   page-size 每页的条数 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" append-to-body @close="adddDialogClosed">
      <!-- 表单内容 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" @>取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDidlogClosed">
      <!-- 表单验证 -->
      <!-- 表单验证规则 引用 添加用户的规则 -->
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 角色设置对话框 -->
    <el-dialog title="角色设置" :visible.sync="roleDialogVisible" width="30%" @close="roleDialogVisibleClosed">
      <div>
        <p>当前的用户:{{ userInfo.username }}</p>
        <p>当前的角色:{{ userInfo.role_name }}</p>
        <el-select v-model="selectRoleId" clearable placeholder="请选择">
          <el-option v-for="item in rolelist" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
        </el-select>
      </div>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义校验规则
    // 邮箱的校验规则
    // rule验证规则 value是验证的值
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
      // test检测是否符合规则 返回布尔值
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱地址'))
    }

    // 手机号的校验规则
    var checkMobile = (rule, value, cb) => {
      const regMobil = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
      if (regMobil.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的手机号'))
    }
    return {
      // 列表信息
      queryInfo: {
        query: '',
        // 当前页码值
        pagenum: 1,
        // 每页显示的条数
        pagesize: 2
      },
      userlist: [],
      // 条数总数
      total: 0,
      // 显示与隐藏添加对话框
      dialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 表单验证 检查(addForm)输入的字符是否符合规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 12, message: '用户名长度为5 ~ 12个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度为5 ~ 12个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      // 角色设置的展开与隐藏
      roleDialogVisible: false,
      userInfo: {},
      // 所有的角色列表
      rolelist: [],
      // 已选中的角色的id值
      selectRoleId: ''
    }
  },
  created() {
    // 获取用户列表
    this.getUserList()
  },
  methods: {
    // 发起数据请求
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户数据失败')
      this.userlist = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 每一页的条数发生改变时的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 页码值改变时的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听 switch 开关的状态
    async userStateChanged(userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        // 如果更新失败就将 已更新的状态取反
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('用户状态更新失败')
      }
      this.$message.success('用户状态更新成功！')
    },
    adddDialogClosed() {
      // 监听添加用户对话框关闭事件
      // 调用引用addFormRef的函数resetFields()
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser() {
      // 表单先验证
      this.$refs.addFormRef.validate(async validate => {
        if (!validate) return
        // 可发起网络请求
        // 将数据以 this.addForm的格式传入
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功^_^')
        // 隐藏对话框
        this.dialogVisible = false
        // 重新获取新的数据
        this.getUserList()
      })
    },
    // 展示编辑修改用户信息对话框
    async showEditDialog(id) {
      // alert(id)
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败')
      }
      this.editForm = res.data
      console.log(this.editForm)
      this.editDialogVisible = true
    },
    // 关闭表单就触发引用editFormRef的重置方法
    editDidlogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo() {
      // 使用表单的引用调用表单得验证方法validata 返回是一个布尔值
      this.$refs.editFormRef.validate(async validate => {
        if (!validate) return
        // 发起请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, this.editForm)
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败')
        }
        //   // 关闭对话框
        this.editDialogVisible = false
        //   // 刷新修改的数据
        this.getUserList()
        //   // 提示修改成功
        this.$message.success('修改信息成功')
      })
    },
    // 根据id删除用户信息
    async removeUserById(id) {
      // 弹框提示用户是否删除
      // 如果点了取消 confirmResult 返回的是cencel , 如果点了确认则返回confirm
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('用户删除成功')
      this.getUserList()
    },
    // 展示设置角色的对话框
    async roleSetting(userInfo) {
      this.userInfo = userInfo
      // 在对话框展示之前，获取所有角色的列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      this.rolelist = res.data
      this.roleDialogVisible = true
    },
    // 保存角色设置信息
    async saveRoleInfo() {
      if (!this.selectRoleId) {
        return this.$message.error('您未选择分配角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('角色更新失败')
      }
      this.$message.success('角色更新成功')
      this.getUserList()
      this.roleDialogVisible = false
    },
    // 角色设置对话框关闭 重置信息
    roleDialogVisibleClosed() {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style></style>
