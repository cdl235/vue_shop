<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单表格区域 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="150px" align="center"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="150px" align="center">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="150px" align="center"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220px">
          <el-button type="primary" icon="el-icon-edit" round size="medium" @click="showBox"></el-button>
          <el-button type="success" icon="el-icon-location" round size="medium" autofocus @click="showProgressBox"></el-button>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>

      <!-- 修改地址对话框 -->
      <el-dialog title="修改地址" :visible.sync="addressDialogVisible" width="40%">
        <el-form :model="addressForm" :rules="addressFormRule" ref="addressFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            <!-- 级联选择器 -->
            <el-cascader v-model="addressForm.address1" :options="cityData" expandTrigger="hover"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 物流信息对话框 -->
      <el-dialog title="物流信息" :visible.sync="progressVisible" width="40%">
        <!-- 时间线 -->
        <el-timeline>
          <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.context">
            {{ activity.context }}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from './citydata.js'

export default {
  data() {
    return {
      // 查询数据
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单数据
      orderlist: [],
      // 订单总条数
      total: 0,
      // 控制地址框的显示
      addressDialogVisible: false,
      // 地址表单
      addressForm: {
        address1: [],
        address2: ''
      },
      // 地址的验证规则
      addressFormRule: {
        address1: [{ required: true, message: '请选择城市', trigger: 'blur' }],
        address2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      // 城市数据
      cityData,
      // 控制物流窗口的展示
      progressVisible: false,
      // 物流信息
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 发起获取订单数据请求
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据失败')
      }
      this.$message.success('获取订单数据成功')
      this.orderlist = res.data.goods
      this.total = res.data.total
    },
    // 每页的条数发生变化时的函数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 页码发生变化时的函数
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 地址框的展示
    showBox() {
      this.addressDialogVisible = true
    },
    // 展示物流窗口信息
    async showProgressBox() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.progressInfo = res.data
      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
