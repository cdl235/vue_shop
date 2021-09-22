<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table class="treeTable" :data="Catelist" :columns="columns" :selection-type="false" :expand-type="false" :show-index="true" index-text="#" border>
        <!-- 作用域插槽 模板列 -->
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success font-size" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
          <i class="el-icon-error font-size" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">等级一</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">等级二</el-tag>
          <el-tag type="warning" v-else>等级三</el-tag>
        </template>
        <!-- 操作-->
        <template slot="option" slot-scope="scope">
          <el-button icon="el-icon-edit" type="warning" size="mini" plain @click="showCateEdit(scope.row.cat_id)">编辑</el-button>
          <el-button icon="el-icon-delete" type="danger" size="mini" plain @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 8, 12]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>

      <!-- 添加分类的对话框 -->
      <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="40%" @close="addCateDialogClosed">
        <!-- 验证表单 -->
        <el-form :model="addCateForm" :rules="addCateFormRule" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <!-- option 是数据源 -->
            <!-- props 是指定配置对象 -->
            <!-- v-model 是 父级分类的id -->
            <el-cascader expandTrigger="hover" v-model="selectedKeys" :options="parentCateList" :props="cascaderPorps" @change="parentCateChanged" clearable></el-cascader>
          </el-form-item>
        </el-form>
        <!-- 底部按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分类编辑 -->
      <el-dialog title="分类信息编辑" :visible.sync="cateEditDialogVisible" width="40%">
        <!-- 表单区域 -->
        <el-form :model="cateEditInfoForm" :rules="cateEditInfoRule" ref="cateEditInfoRef" label-width="100px" class="demo-ruleForm">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="cateEditInfoForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="分类等级" prop="cat_level">
            <el-input v-model="cateEditInfoForm.cat_level"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer">
          <el-button @click="dialogVisibcateEditDialogVisiblele = false">取 消</el-button>
          <el-button type="primary" @click="saveCateEditInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        // 当前页码值
        pagenum: 1,
        // 每页的条数
        pagesize: 5
      },
      // 商品分类的数据
      Catelist: [],
      // 总数据条数
      total: 0,
      // 指定table的列的信息
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        // type 是把当前列定义为模板列（插槽）   template 定义模板列名称
        { label: '是否有效', type: 'template', template: 'isok' },
        // 排序
        { label: '排序', type: 'template', template: 'order' },
        // 操作
        { label: '操作', type: 'template', template: 'option' }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        // 要添加的分类名称
        cat_name: '',
        // 要添加的分类id 不填就是为1级
        cat_pid: 0,
        // 要添加的分类等级 默认不填就是为1级
        cat_level: 0
      },
      // 添加分类的验证规则
      addCateFormRule: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      parentCateList: [],
      // 父级分类的id数组
      selectedKeys: [],
      // 指定联级对象的配置对象
      cascaderPorps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: 'true'
      },
      cateEditDialogVisible: false,
      cateEditInfoForm: [],
      cateEditInfoRule: {
        cat_name: [{ message: '请输入分类名称', trigger: 'blur' }],
        cat_level: [{ required: true, message: '请输入分类等级', trigger: 'blur' }, { message: '输入0~2的数字 0为等级一 1为等级二 2为等级三' }]
      }
    }
  },
  created() {
    this.getCatelist()
  },
  methods: {
    async getCatelist() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表数据失败')
      }
      this.Catelist = res.data.result
      this.total = res.data.total
      console.log(res)
    },
    // 当页面条数改变时的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCatelist()
    },
    // 当页面数改变时的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCatelist()
    },
    // 添加分类按钮的展开
    showAddCate() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
    },
    // 选项发生变化时触发这个函数
    parentCateChanged() {
      // 若果selectKeys 数组中 的length大于0 证明选中父级分类
      // 反之 就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父分类的id 和 为当前分类等级赋值
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新分类
    addCate() {
      this.$refs.addCateFormRef.validate(async validate => {
        if (!validate) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCatelist()
        this.addCateDialogVisible = false
      })
    },
    // 关闭添加分类的对话框时重置信息
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 根据 id 查询分类 获取信息
    async showCateEdit(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败')
      }
      this.cateEditInfoForm = res.data
      this.cateEditDialogVisible = true
    },
    // 编辑提交分类信息
    saveCateEditInfo() {
      this.$refs.cateEditInfoRef.validate(async validate => {
        if (!validate) return
        const { data: res } = await this.$http.put('categories/' + this.cateEditInfoForm.cat_id, this.cateEditInfoForm)
        if (res.meta.status !== 200) {
          return this.$message.error('用户分类更新失败')
        }
        this.$message.success('用户更新成功')
        this.getCatelist()
        this.cateEditDialogVisible = false
      })
    },
    async deleteCate(id) {
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getCatelist()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
  font-size: 13px;
}
.el-cascader {
  width: 100%;
}
.font-size {
  font-size: 16px;
}
</style>
