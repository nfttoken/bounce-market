import { useIntl } from 'react-intl'

export default function UseIntl() {
    const intl = useIntl()

    const wrapperIntl = (id, option) => {
        const text = intl.formatMessage({
            id: id,
            values: option,
            defaultMessage: 'loading'
        })
        return text
    }

    return {
        wrapperIntl
    }
}
