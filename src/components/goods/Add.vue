<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert title="添加商品信息" type="info" :closable="false" show-icon center> </el-alert>

      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center="">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 添加表单区域 -->
      <el-form :model="addForm" :rules="addFormRule" ref="addFormRef" label-width="100px" label-position="top">
        <!-- 标签区域 -->
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabsLeave" @tab-click="tabClick">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" expandTrigger="hover" :props="cateProp" @change="handleChange" clearable></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadUrl" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headersObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑框 -->
            <quill-editor v-model="addForm.goods_introduce" />
            <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <!-- 图片预览框 -->
      <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
        <img :src="preview" alt="" class="previewImg" />
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
// 导入lodash 进行深拷贝
import _ from 'lodash'

export default {
  // 注 attr_vals是商品分类id的数组
  data() {
    return {
      activeIndex: '0',
      // 添加表单的数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        // 商品所属分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品介绍
        goods_introduce: '',
        // 商品的参数
        attrs: []
      },
      // 表单的验证规则
      addFormRule: {
        goods_name: [{ required: 'ture', message: '商品名称还没输入哦亲!', trigger: 'blur' }],
        goods_price: [{ required: 'ture', message: '商品价格还没输入哦亲!', trigger: 'blur' }],
        goods_weight: [{ required: 'ture', message: '商品重量还没输入哦亲!', trigger: 'blur' }],
        goods_number: [{ required: 'ture', message: '商品数量还没输入哦亲!', trigger: 'blur' }]
      },
      // 分类列表数据
      cateList: [],
      // 分类配置选项
      cateProp: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的分类表单
      cateForm: [],
      // 动态参数的数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 图片上传的地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 组件上传的请求头对象
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的真实路径
      preview: '',
      // 图片预览框的展示与隐藏
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.$message.success('获取分类列表成功')
      this.cateList = res.data
      console.log(res)
    },
    // 选项发生改变时触发函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 在标签切换之前看符不符合条件
    beforeTabsLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 点击表单切换是触发
    async tabClick() {
      // 如果点击的是索引为1的标签 就发起请求
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })

        if (res.meta.status !== 200) {
          return this.$message.error('请求参数失败!')
        }

        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })

        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })

        if (res.meta.status !== 200) {
          return this.$message.error('请求参数失败!')
        }

        console.log(res)
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览
    handlePreview(file) {
      this.preview = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理图片移除操作
    handleRemove(file) {
      // 1.获取图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从pics 数组中找到图片的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3. 调用数组中 splice 把图片信息对象移除
      this.addForm.pics.splice(i, 1)
    },
    // 图片上传成功的函数
    handleSuccess(response) {
      // 拼接图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      //  将图片信息对象添加到添加表单中的 pics 数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async validate => {
        if (!validate) {
          return this.$message.error('必填项未完成哦')
        }
        // 执行添加的业务逻辑
        // 使用lodash的cloneDeep语句进行深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')

        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(newInfo)
        })

        // 处理静态参数
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })

        // 将处理完的参数数组 赋值给 深拷贝的数组中
        form.atrrs = this.addForm.attrs

        // 发起请求
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('商品添加失败')
        }
        this.$message.success('商品添加成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 当前三级分类的id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.addBtn {
  margin-top: 15px;
}
</style>
