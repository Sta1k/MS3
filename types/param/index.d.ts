type Param = {
    _id?: string,
    point_id?: string,
    name: string,
    type: string,
    code: string,
    remote_key?: string,
    hardware_address: number,
    isMonitored: boolean,
    measure: string,
    state: {
        lastActivity: Date,
        value: number,
        measureValues: {
            startValue: number,
            endValue: number,
            color?: string,
            type?: string
        },
        alertValues: AlertCondition[]
    }
};

type AlertCondition = {
    cond: string,
    value: number
};