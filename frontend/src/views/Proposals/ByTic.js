import React, { useState, useEffect, useContext, useRef } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import { Title } from '../../components/Typography'
import { BrowseMenu, ChartOptions } from '../../components/Menus'
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import { ProposalsPieChart, ProposalsBarChart } from '../../components/Charts'
import { CircularLoader } from '../../components/Progress/Progress'
import { ProposalsTable } from '../../components/Tables'
import { SettingsContext } from '../../contexts/SettingsContext'

export const ProposalsByTic = props => {
    const [store, ] = useContext(StoreContext)
    const [settings] = useContext(SettingsContext)
    const [proposalsByTic, setProposalsByTic] = useState()
    const [displayedProposals, setDisplayedProposals] = useState()
    const [tableTitle, setTableTitle] = useState('')
    const [chartType, setChartType] = useState('pie')
    const [chartSorting, setChartSorting] = useState('alpha')
    const [hideEmptyGroups, setHideEmptyGroups] = useState(settings.charts.hideEmptyGroups)
    const tableRef = useRef(null)
    
    useEffect(() => {
        if (store.proposals && store.tics) {
            const tics = store.tics.map(({ name }) => ({ name: name, proposals: [] })).concat({ name: 'Unassigned', proposals: [] })
            const unassignedTicsIndex = tics.findIndex(({ name }) => name === 'Unassigned')
            store.proposals.forEach(proposal => {
                const index = tics.findIndex(({ name }) => name === proposal.assignToInstitution)
                if (index >= 0) {
                    tics[index].proposals.push(proposal)
                } else {
                    tics[unassignedTicsIndex].proposals.push(proposal)
                }
            })
            setProposalsByTic(tics)
        }
    }, [store])

    const selectProposals = (props) => {
        if (props.data) props = props.data  // Patch for issue #23
        const index = proposalsByTic.findIndex(tic => tic.name === props.id)
        setTableTitle('Assigned TIC/TIC: ' + props.id)
        setDisplayedProposals(proposalsByTic[index].proposals)
        scrollToTable()
    }
    
    const handleSelectGraphType = (event, type) => setChartType(type)
    const handleSelectGraphSorting = (event, sorting) => setChartSorting(sorting)
    const handleToggleHideEmptyGroups = event => setHideEmptyGroups(event.target.checked)

    const scrollToTable = () => {
        setTimeout(() => tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500)
    }

    return (
        <div>
            <Title>
                <Grid container>
                    <Grid item style={{ flex: 1 }}>
                        Proposals by TIC/RIC
                    </Grid>
                    <Grid item>
                        <BrowseMenu />
                    </Grid>
                </Grid>
            </Title>

            <Grid container spacing="4">

                <Grid item xs={ 12 }>
                    <Card>
                        <CardHeader action={
                            <ChartOptions
                                sortingSelectionHandler={ handleSelectGraphSorting } currentSorting={ chartSorting }
                                typeSelectionHandler={ handleSelectGraphType } currentType={ chartType }
                                toggleHideEmptyGroupsHandler={ handleToggleHideEmptyGroups } hideEmptyGroups={ hideEmptyGroups }
                            />
                        } />
                        <CardContent>
                            {
                                proposalsByTic && chartType === 'pie'
                                && <ProposalsPieChart proposals={ proposalsByTic } clickHandler={ selectProposals } height={ 600 } sorting={ chartSorting } />
                            }
                            {
                                proposalsByTic && chartType === 'bar'
                                && <ProposalsBarChart proposals={ proposalsByTic } clickHandler={ selectProposals } height={ 200 } sorting={ chartSorting } />
                            }
                            { !proposalsByTic && <CircularLoader /> }
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 }>
                    <div ref={ tableRef }></div>
                    <ProposalsTable title={ tableTitle } proposals={ displayedProposals } paging={ false } />
                </Grid>

            </Grid>

        </div>
    )
}
