<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意: 只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon> </el-alert>
      <!-- 商品分类区 -->
      <el-row class="cat_opt">
        <el-col style="margin:15px 0 25px 0">
          <span style="margin-right:15px">选择商品分类:</span>
          <el-cascader v-model="selectedCateKeys" :options="catelist" expandTrigger="hover" :props="cateProp" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <!-- v-model 控制切换控制哪个页面  @tab-click 是点击tab标签后的事件-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 内容表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <!-- 小标签 -->
              <template slot-scope="scrope">
                <el-tag v-for="(item, i) in scrope.row.attr_vals" :key="i" closable @close="handleClose(i, scrope.row)">{{ item }}</el-tag>
                <!-- 输入框 -->
                <el-input class="input-new-tag" v-if="scrope.row.inputVisible" v-model="scrope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scrope.row)" @blur="handleInputConfirm(scrope.row)"> </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scrope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scrope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditvisible(scrope.row.attr_id)">编辑</el-button>
                <el-button type="warning" icon="el-icon-delete" size="mini" @click="deleteParams(scrope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 内容表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <!-- 小标签 -->
              <template slot-scope="scrope">
                <el-tag v-for="(item, i) in scrope.row.attr_vals" :key="i" closable @close="handleClose(i, scrope.row)">{{ item }}</el-tag>
                <!-- 输入框 -->
                <el-input class="input-new-tag" v-if="scrope.row.inputVisible" v-model="scrope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scrope.row)" @blur="handleInputConfirm(scrope.row)"> </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scrope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scrope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditvisible(scrope.row.attr_id)">编辑</el-button>
                <el-button type="warning" icon="el-icon-delete" size="mini" @click="deleteParams(scrope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加参数/属性对话框 -->
      <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <!-- 验证表单区域 -->
        <el-form :model="addForm" :rules="addFormRule" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑参数/属性对话框 -->
      <el-dialog :title="'编辑' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <!-- 验证表单区域 -->
        <el-form :model="editForm" :rules="editFormRule" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选择框的配置对象
      cateProp: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定id的数组
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态参数的数据列表
      manyTableData: [],
      // 静态参数的数据列表
      onlyTableData: [],
      // 切换显示对话框显示隐藏
      addDialogVisible: false,
      // 添加表单数据
      addForm: {
        attr_name: ''
      },
      // 添加的验证规则
      addFormRule: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      // 编辑对话框的状态
      editDialogVisible: false,
      // 被编辑的数据表单
      editForm: {},
      // 编辑的验证的规则
      editFormRule: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    // 获取分类列表
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.catelist = res.data
    },
    // 级联选择器发生变化 会触发这个函数
    handleChange() {
      // 调佣获取参数列表函数
      this.getParamsList()
    },
    // tab标签页被点击时处罚的事件
    handleTabClick() {
      // 调佣获取参数列表函数
      this.getParamsList()
    },
    // 获取参数列表
    async getParamsList() {
      // 如果选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 证明选中的是三级分类 发起请求
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.info('先选择分类哦！')
      }
      // 将数据里额atter_vals的值以数组的方式保存 以空格隔开  split是以数组方式保存
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的展示与隐藏
        item.inputVisible = false
        // 文本框输入的值
        item.inputValue = ''
      })
      // this.$message.success('获取参数成功')
      // 判断是动态数据页面还是静态数据页面 把获取来的数据放入对应的数组中
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 关闭添加框 重置里面的信息
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数按钮
    addParams() {
      this.$refs.addFormRef.validate(async validate => {
        if (!validate) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) {
          return this.$message.error('添加属性失败')
        }
        this.$message.success('添加属性成功')
        this.getParamsList()
        this.addDialogVisible = false
      })
    },
    // 编辑对话框的展示
    async showEditvisible(id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取编辑信息失败')
      }
      this.$message.success('获取编辑信息成功')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 对话框关闭时重置信息
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑框确定保存信息
    editParams() {
      this.$refs.editFormRef.validate(async validate => {
        if (!validate) return
        // 发起请求
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) {
          return this.$message.error('修改' + this.titleText + '失败')
        }
        this.$message.success('修改' + this.titleText + '成功')
        this.getParamsList()
        this.editDialogVisible = false
      })
    },
    // 删除参数
    async deleteParams(id) {
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除' + this.titleText + '失败')
      }
      this.$message.success('删除' + this.titleText + '成功')
      this.getParamsList()
    },
    // 文本框失去焦点和按下enter键会触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果么有return出去 就做后续处理
      // 将文本框的文字 添加到当前参数的数组中
      // 去掉空格
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 发起请求 保存这次操作
      this.saveAttrVals(row)
    },
    // 将保存的数据 添加到数据库中
    async saveAttrVals(row) {
      // 发起请求 保存这次操作
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ') })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }
      this.$message.success('修改参数项成功')
    },
    // 点击按钮展示文本框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 当页面重新完全渲染之后 才会执行里面的回调函数
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除可选项小标签
    async handleClose(i, row) {
      // 从索引i开始删除一个元素
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 如果添加按钮需要被禁用 返回ture 反之返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 当前选中的三级分类的id
    cateId() {
      return this.selectedCateKeys[2]
    },
    // 动态计算标题文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15pxx;
}
.input-new-tag {
  width: 120px;
}
</style>
