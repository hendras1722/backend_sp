function Response(
  res,
  status,
  message,
  data = {},
  errors = undefined,
  code = 400
) {
  if (status) {
    return res.json({
      status: 'success',
      message,
      data,
    })
  }
  return res.status(code).json({
    status: 'Error',
    message,
    errors,
    data,
  })
}

module.exports = {
  Response,
}
