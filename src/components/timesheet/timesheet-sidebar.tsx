import React from 'react'

export const TimesheetSidebar = ({lists}) => {

    return (
        <div className="aside">
            {lists.map(({name, children}, key) => (
                <div className="side-item" key={key}>
                    {
                        key === 0
                            ? <div className="side-list side-placeholder">
                                <div className="name"></div>
                                <div className="placeholder"></div>
                            </div>
                            : ''
                    }
                    <div className="side-list side-scroll side-restaurant">
                        {/*<div className="name restaurant-name">{name}</div>*/}
                        {/*<div className="placeholder placeholder-restaurant"></div>*/}
                    </div>

                    <div className="list-item side-scroll">
                        {children.map((child, i) => (
                            <div className="group" key={i}>
                                <div className="name-room">{child.name}</div>
                                <div className="capacity-room">{child.capacity}</div>
                            </div>
                        ))}
                    </div>

                </div>
            ))}
        </div>
    )
}