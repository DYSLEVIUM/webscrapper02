import { showNotification } from '@mantine/notifications';

export const successToast = (title: string, message: string) => {
    showNotification({
        title: title,
        message: message,
        styles: (theme) => ({
            root: {
                backgroundColor: theme.colors.green[7],
                borderColor: theme.colors.green[7],

                '&::before': { backgroundColor: theme.white },
                margin: '0 16px 0 0',
            },

            title: { color: theme.white },
            description: { color: theme.white },
            closeButton: {
                color: theme.white,
                '&:hover': { backgroundColor: theme.colors.green[8] },
            },
        }),
    });
};

export const infoToast = (title: string, message: string) => {
    showNotification({
        title: title,
        message: message,
        styles: (theme) => ({
            root: {
                backgroundColor: theme.colors.blue[7],
                borderColor: theme.colors.blue[7],

                '&::before': { backgroundColor: theme.white },
                margin: '0 16px 0 0',
            },

            title: { color: theme.white },
            description: { color: theme.white },
            closeButton: {
                color: theme.white,
                '&:hover': { backgroundColor: theme.colors.blue[8] },
            },
        }),
    });
};

export const errorToast = (title: string, message: string) => {
    showNotification({
        title: title,
        message: message,
        styles: (theme) => ({
            root: {
                backgroundColor: theme.colors.red[7],
                borderColor: theme.colors.red[7],

                '&::before': { backgroundColor: theme.white },
                margin: '0 16px 0 0',
            },

            title: { color: theme.white },
            description: { color: theme.white },
            closeButton: {
                color: theme.white,
                '&:hover': { backgroundColor: theme.colors.red[8] },
            },
        }),
    });
};
