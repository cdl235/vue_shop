<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
      <!-- 表格区域 -->
      <el-table :data="roleslist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'rowcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 一级权限渲染 -->
              <el-col :span="5">
                <el-tag closable @close="removePermission(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限和三级权限渲染 -->
              <el-col :span="19">
                <!-- 嵌套渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'rowcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removePermission(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级权限 -->
                    <el-tag type="warning" :class="[i3 === 0 ? '' : 'bdtop', 'rowcenter']" v-for="(item3, i3) in item2.children" :key="item3.id" closable @close="removePermission(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

            <pre>
              {{ scope.row }}
            </pre>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column label="角色名称" align="center" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" align="center" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" align="center" width="400px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" round @click="showEditRoles(scope.row.id)">编辑</el-button>
            <el-button type="success" size="mini" icon="el-icon-delete" round @click="removeRole(scope.row.id)">删除</el-button>
            <el-button type="warning" size="mini" icon="el-icon-setting" round @click="showRightDialog(scope.row)">设置权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 编辑角色表单 -->
      <el-dialog title="编辑角色" :visible.sync="editRolesVisible" width="30%" append-to-body @close="editRolesClosed">
        <!-- 表单区域 -->
        <el-form :model="editRoles" :rules="editRolesRules" ref="editRolesRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoles.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="editRoles.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮 -->
        <span slot="footer">
          <el-button @click="editRolesVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRolesInfo">确 定</el-button>
        </span>
      </el-dialog>

      <!--添加角色表单  -->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed" append-to-body>
        <!-- 表单内容 -->
        <el-form :model="addUserForm" :rules="editRolesRules" ref="addUserFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addUserForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="addUserForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 角色权限对话框 -->
      <el-dialog title="用户权限分配" :visible.sync="showRightDialogVisible" width="30%" @close="showRightDialogVisibleclosed">
        <!-- 树形控件 -->
        <el-tree :data="rightslist" :props="treeProps" ref="treeRef" node-key="id" :default-checked-keys="defkeys" show-checkbox default-expand-all></el-tree>

        <span slot="footer" class="dialog-footer">
          <el-button @click="showRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRight">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表
      roleslist: [],
      // 编辑的角色列表
      editRoles: [],
      // 编辑框的展示与隐藏
      editRolesVisible: false,
      // 表单验证
      editRolesRules: {
        roleName: [{ required: true, message: '请输入修改的角色名称', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入的角色描述', trigger: 'blur' }]
      },
      // 添加用户表单的显示与隐藏
      addDialogVisible: false,
      // 添加的用户信息
      addUserForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加用户的验证规则
      // addUserFormRules: {
      //   addrolesName: [
      //     { required: true, message: '请输入正确的名称', trigger: 'blur' },
      //     { min: 3, max: 10, message: '请输入3-10个字符', trigger: 'blur' }
      //   ]
      // }
      // 权限对话框的显示与隐藏
      showRightDialogVisible: false,
      rightslist: [],
      // 树形控件属性绑定
      treeProps: {
        // 通过children节点实现嵌套
        children: 'children',
        // 显示的每个属性的值
        label: 'authName'
      },
      // 默认选中的节点ID
      defkeys: [],
      // 当前分配权限的角色id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 发起请求获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleslist = res.data
      console.log(this.roleslist)
    },
    // 编辑按钮
    async showEditRoles(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('编辑角色信息失败')
      }
      this.editRoles = res.data
      this.editRolesVisible = true
    },
    // 关闭编辑窗口就还原信息
    editRolesClosed() {
      this.$refs.editRolesRef.resetFields()
    },
    // 修改角色并提交
    editRolesInfo() {
      // 验证表单
      this.$refs.editRolesRef.validate(async validate => {
        if (!validate) return
        // 发起请求
        const { data: res } = await this.$http.put('roles/' + this.editRoles.roleId, { roleName: this.editRoles.roleName, roleDesc: this.editRoles.roleDesc })
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色信息失败')
        }
        // // 关闭对话框
        this.editRolesVisible = false
        // // 重新刷新数据
        this.getRolesList()
        // // 提示修改成功
        this.$message.success('修改信息成功')
      })
    },
    addDialogClosed() {
      // 监听添加用户的对话框关闭事件
      // 重置信息
      this.$refs.addUserFormRef.resetFields()
    },
    // 添加用户
    addRoles() {
      this.$refs.addUserFormRef.validate(async validate => {
        if (!validate) return
        // 发起请求
        const { data: res } = await this.$http.post('roles', this.addUserForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败!')
        }
        console.log(res)
        // 提示用户添加成功
        this.$message.success('添加用户成功')
        // 关闭窗口
        this.addDialogVisible = false
        // 重新刷新数据
        this.getRolesList()
      })
    },
    async removeRole(id) {
      /// / 如果点了取消 confirmResult 返回的是cencel , 如果点了确认则返回confirm
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '小tips', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      // 发起请求
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.$message.success('角色删除成功')
      this.getRolesList()
    },
    // 根据id删除对应的权限
    // role是传过来的的当前项的data permissionId是当前权限的id
    async removePermission(role, permissionId) {
      const confirmResult = await this.$confirm('此操作将删除该角色权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 发起删除请求
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${permissionId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色权限失败')
      }
      this.$message.success('删除角色权限成功')
      // 因为res.data返回的是最新的数据 所以不用全局刷新
      role.children = res.data
    },
    // 角色权限分配对话框的展开
    async showRightDialog(role) {
      this.roleId = role.id
      // 获取所有用户的权限（树形）
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('用户权限获取失败')
      }
      // 将获取来的数据保存到rightlist中
      this.rightslist = res.data
      // 递归获取三级节点的ID
      this.getLeafKeys(role, this.defkeys)
      this.showRightDialogVisible = true
    },
    // 通过递归的形式，获取角色的三级权限的id，保存到defkeys[]中
    getLeafKeys(node, arr) {
      // 当前node节点不包含children属性 就是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果当前不是三级节点,就遍历节点的children属性 重新调用getLeafKeys()方法item就是一个节点node，arr是数组
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 权限对话框关闭清空数组
    showRightDialogVisibleclosed() {
      this.defkeys = []
    },
    // 确定分配权限
    async allotRight() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.showRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scrope>
.el-tag {
  margin: 8px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.rowcenter {
  display: flex;
  align-items: center;
}
</style>
