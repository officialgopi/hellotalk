import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";

const useErrors = (errors = []) => {
  useEffect(() => {
    errors.forEach(
      ({
        isError,
        error,
        fallback,
      }: {
        isError: any;
        error: any;
        fallback: any;
      }) => {
        if (isError) {
          if (fallback) fallback();
          else toast.error(error?.data?.message || "Something went wrong");
        }
      },
    );
  }, [errors]);
};

const useAsyncMutation = (mutatationHook: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);

  const [mutate] = mutatationHook();

  const executeMutation = async (toastMessage: string, ...args: any) => {
    setIsLoading(true);
    const toastId = toast.loading(toastMessage || "Updating data...");

    try {
      const res = await mutate(...args);

      if (res.data) {
        toast.success(res.data.message || "Updated data successfully", {
          id: toastId,
        });
        setData(res.data);
      } else {
        toast.error(res?.error?.data?.message || "Something went wrong", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("Something went wrong", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return [executeMutation, isLoading, data] as const;
};

const useSocketEvents = (
  socket: Socket,
  handlers: Record<string, (...args: any) => any>,
) => {
  useEffect(() => {
    Object.entries(handlers).forEach(([event, handler]) => {
      socket?.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket?.off(event, handler);
      });
    };
  }, [socket, handlers]);
};

export { useErrors, useAsyncMutation, useSocketEvents };
