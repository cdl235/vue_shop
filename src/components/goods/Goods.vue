<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>列表商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 商品搜索/添加区域 -->
      <el-row :gutter="20">
        <!-- 搜索框 -->
        <el-col :span="8">
          <!-- 绑定查询条件 点击清空按钮就重新加载数据 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="goAppPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格内容区域 -->
      <el-table :data="goodslist" border stripe>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="95px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="170px">
          <template slot-scope="scope">{{ scope.row.add_time | dateFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160px">
          <template slot-scope="scope">
            <el-button type="warning" icon="el-icon-edit" size="mini" circle @click="editGoods(scope.row.goods_id)">编辑</el-button>

            <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="deleteGoods(scope.row.goods_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 20, 25]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>

      <!-- 编辑框 -->
      <el-dialog title="编辑商品" :visible.sync="editDialogVisibled" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRule" ref="editFormRef" label-width="90px">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="editForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="editForm.goods_weight"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisibled = false">取 消</el-button>
          <el-button type="primary" @click="editSave">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询数据对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodslist: [],
      // 商品总条数
      total: 0,
      // 编辑商品表单
      editForm: [],
      // 控制编辑框的展示
      editDialogVisibled: false,
      // 验证规则
      editFormRule: {
        goods_name: [{ required: 'true', message: '输入最新的名称', blur: 'true' }],
        goods_price: [{ required: 'true', message: '输入最新的价格', blur: 'true' }],
        goods_weight: [{ required: 'true', message: '输入最新的重量', blur: 'true' }]
      }
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表信息
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      // this.$message.success('获取商品列表成功')
      console.log(res)
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    // 每页的条数发生变化时触发
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    //  当页码值发生变化时
    handleCurrentChange(nwePage) {
      this.queryInfo.pagenum = nwePage
      this.getGoodsList()
    },
    // 删除商品
    async deleteGoods(id) {
      const confirmResult = await this.$confirm('此操作将删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      // 发起请求
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$methods.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },
    // 点击添加按钮 跳转页面
    goAppPage() {
      this.$router.push('/add')
    },
    // 点击编辑商品
    async editGoods(id) {
      const { data: res } = await this.$http.get(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('商品信息获取失败')
      }
      this.editForm = res.data
      this.editDialogVisibled = true
    },
    // 还原表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 保存编辑内容
    editSave() {
      this.$refs.editFormRef.validate(async validate => {
        if (!validate) return

        // 发起请求
        const { data: res } = await this.$http.put('goods/ ' + this.editForm.goods_id, this.editForm)
        if (res.meta.status !== 200) {
          return this.$message.error('修改商品失败')
        }
        this.$message.success('商品修改成功')
        this.getGoodsList()
        this.editDialogVisibled = false
      })
    }
  }
}
</script>

<style lang="less" scoped></style>
