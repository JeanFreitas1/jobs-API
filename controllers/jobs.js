const Job = require('../models/Job');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

//roles atuais dos usuarios ['admin', 'regular']

const getAllJobs = async (req, res) => {
  //validando admin
  const user = await User.findById(req.user.userId);
  //define o filtro
  let filt = { createdBy: req.user.userId };
  if (user.role === 'admin') filt = {};
  //executa a query pegando todos os jobs
  const jobs = await Job.find(filt).sort('createdAt');
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  //validando admin
  const user = await User.findById(userId);
  //define o filtro
  let filt = { _id: jobId, createdBy: userId };
  if (user.role === 'admin') filt = { _id: jobId };
  //executa a query pegando todos os jobs

  const job = await Job.findOne(filt);
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;

  if (company === '' || position === '') {
    throw new BadRequestError('Company or Position fields cannot be empty');
  }

  //validando admin
  const user = await User.findById(userId);
  //define o filtro
  let filt = { _id: jobId, createdBy: userId };
  if (user.role === 'admin') filt = { _id: jobId };
  //executa a query pegando todos os jobs

  const job = await Job.findOneAndUpdate(filt, req.body, {
    new: true,
    runValidators: true,
  });

  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  //validando admin
  const user = await User.findById(userId);
  //define o filtro
  let filt = { _id: jobId, createdBy: userId };
  if (user.role === 'admin') filt = { _id: jobId };
  //executa a query pegando todos os jobs

  const job = await Job.findOneAndDelete(filt);

  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  res.status(StatusCodes.OK).send();
};

module.exports = { getAllJobs, getJob, createJob, updateJob, deleteJob };
