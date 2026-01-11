class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // Knex Query Builder instance (vd: db('users'))
    this.queryString = queryString; // req.query từ Express
  }

  // Lọc nâng cao & So sánh
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Xử lý các toán tử so sánh (gte, gt, lte, lt, neq)
    // Ví dụ cách sử dụng: ?score[gte]=10&score[lte]=100 hoặc ?status=active
    Object.keys(queryObj).forEach((key) => {
      const value = queryObj[key];

      if (typeof value === 'object') {
        // Trường hợp có toán tử: VD:score[gte]=10
        const operators = {
          gte: '>=',
          gt: '>',
          lte: '<=',
          lt: '<',
          neq: '<>',
        };
        
        Object.keys(value).forEach((op) => {
          if (operators[op]) {
            this.query.where(key, operators[op], value[op]);
          }
        });
      } else {
        // Trường hợp bằng thông thường: VD:status=active
        this.query.where(key, '=', value);
      }
    });

    return this;
  }

  // Sắp xếp (Sort)
  // Client gửi: ?sort=price (tăng dần) hoặc ?sort=-price (giảm dần)
  // Hoặc nhiều tiêu chí: ?sort=-score,created_at
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').map((field) => {
        if (field.startsWith('-')) {
          return { column: field.substring(1), order: 'desc' };
        }
        return { column: field, order: 'asc' };
      });
      
      this.query.orderBy(sortBy);
    } else {
      this.query.orderBy('created_at', 'desc');
    }

    return this;
  }

  // Chọn trường hiển thị (Field Limiting)
  // Ví dụ: ?fields=name,email,avatar_url
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',');
      this.query.select(fields);
    } else {
      this.query.select('*');
    }

    return this;
  }

  // Phân trang (Pagination)
  // Ví dụ: ?page=2&limit=10
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query.offset(skip).limit(limit);

    return this;
  }

  // Tìm kiếm (Search)
  // Ví dụ: ?search=keyword
  search(searchFields = []) {
    if (this.queryString.search && searchFields.length > 0) {
      const keyword = `%${this.queryString.search}%`;
      
      this.query.where((builder) => {
        searchFields.forEach((field, index) => {
          if (index === 0) {
            builder.where(field, 'ilike', keyword);
          } else {
            builder.orWhere(field, 'ilike', keyword);
          }
        });
      });
    }
    return this;
  }
}

module.exports = APIFeatures;