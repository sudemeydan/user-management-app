import prisma from '../utils/prisma';
import { Connection } from '@prisma/client';

const createConnection = async (senderId: string | number, receiverId: string | number) => {
  return await prisma.connection.create({
    data: { senderId: Number(senderId), receiverId: Number(receiverId), status: "PENDING" }
  });
};

const findConnection = async (senderId: string | number, receiverId: string | number) => {
  return await prisma.connection.findFirst({
    where: { senderId: Number(senderId), receiverId: Number(receiverId) }
  });
};

const findConnectionById = async (connectionId: string | number) => {
  return await prisma.connection.findUnique({
    where: { id: Number(connectionId) }
  });
};

const updateConnectionStatus = async (connectionId: string | number, status: string) => {
  return await prisma.connection.update({
    where: { id: Number(connectionId) },
    data: { status }
  });
};

const deleteConnection = async (connectionId: string | number) => {
  return await prisma.connection.delete({
    where: { id: Number(connectionId) }
  });
};

export default {
  createConnection,
  findConnection,
  findConnectionById,
  updateConnectionStatus,
  deleteConnection
};
